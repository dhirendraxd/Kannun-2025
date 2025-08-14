import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SharedDocument {
  id: string;
  student_id: string;
  university_id: string;
  application_id: string | null;
  document_id: string;
  shared_at: string;
  status: 'pending' | 'viewed' | 'approved' | 'rejected';
  university_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  student_documents?: {
    document_type: string;
    file_name: string;
    file_url: string;
    status: string;
  };
  student_profiles?: {
    full_name: string;
    email: string;
    phone: string;
  };
  student_applications?: {
    application_date: string;
    status: string;
  };
  university_programs?: {
    title: string;
    degree_level: string;
  };
}

export const useSharedDocuments = (universityId?: string) => {
  const [sharedDocuments, setSharedDocuments] = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSharedDocuments = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('student_university_shared_documents')
        .select(`
          *,
          student_documents (
            document_type,
            file_name,
            file_url,
            status
          ),
          student_profiles!student_university_shared_documents_student_id_fkey (
            full_name,
            email,
            phone
          ),
          student_applications (
            application_date,
            status
          ),
          university_programs!student_applications_program_id_fkey (
            title,
            degree_level
          )
        `)
        .order('created_at', { ascending: false });

      if (universityId) {
        query = query.eq('university_id', universityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSharedDocuments(data as unknown as SharedDocument[] || []);
    } catch (error: Error | unknown) {
      console.error('Error loading shared documents:', error);
      toast({
        title: 'Error loading shared documents',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [universityId, toast]);

  const updateDocumentStatus = async (
    documentId: string,
    status: 'pending' | 'viewed' | 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('student_university_shared_documents')
        .update({
          status,
          university_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;

      // Update local state
      setSharedDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, status, university_notes: notes || doc.university_notes }
            : doc
        )
      );

      toast({
        title: 'Document status updated',
        description: `Document marked as ${status}`,
        variant: 'default',
      });
    } catch (error: Error | unknown) {
      console.error('Error updating document status:', error);
      toast({
        title: 'Error updating document',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadSharedDocuments();
  }, [loadSharedDocuments]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('shared-documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_university_shared_documents',
          filter: universityId ? `university_id=eq.${universityId}` : undefined,
        },
        () => {
          loadSharedDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [universityId, loadSharedDocuments]);

  return {
    sharedDocuments,
    loading,
    loadSharedDocuments,
    updateDocumentStatus,
  };
};

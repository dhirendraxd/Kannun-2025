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
      
      // For now, let's load student applications to this university
      // and show their documents through the student profiles
      const { data: applications, error } = await supabase
        .from('student_applications')
        .select(`
          *,
          university_programs (
            title,
            degree_level
          ),
          student_profiles!student_applications_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .eq('university_id', universityId)
        .order('application_date', { ascending: false });

      if (error) throw error;

      // Now load documents for each student who applied
      const studentsWithDocuments = [];
      
      if (applications && applications.length > 0) {
        for (const application of applications) {
          const { data: studentDocs, error: docsError } = await supabase
            .from('student_documents')
            .select('*')
            .eq('user_id', application.user_id)
            .eq('status', 'uploaded');

          if (!docsError && studentDocs && studentDocs.length > 0) {
            // Create a shared document entry for each document
            studentDocs.forEach(doc => {
              studentsWithDocuments.push({
                id: `${application.id}-${doc.id}`, // Unique ID
                student_id: application.user_id,
                university_id: universityId,
                application_id: application.id,
                document_id: doc.id,
                shared_at: application.application_date,
                status: 'pending' as const,
                university_notes: null,
                created_at: application.created_at,
                updated_at: application.updated_at,
                student_documents: {
                  document_type: doc.document_type,
                  file_name: doc.file_name,
                  file_url: doc.file_url,
                  status: doc.status
                },
                student_profiles: application.student_profiles,
                student_applications: {
                  application_date: application.application_date,
                  status: application.status
                },
                university_programs: application.university_programs
              });
            });
          }
        }
      }

      setSharedDocuments(studentsWithDocuments);
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
      // For now, we'll just update the local state since we don't have the shared documents table
      // In a real implementation, this would update the application status
      
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

      // Could also update the application status if needed
      // const applicationId = documentId.split('-')[0];
      // await supabase
      //   .from('student_applications')
      //   .update({ status: status === 'approved' ? 'accepted' : 'pending' })
      //   .eq('id', applicationId);

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

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSharedDocuments, SharedDocument } from '@/hooks/useSharedDocuments';
import { FileText, Eye, Download, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharedDocumentsViewProps {
  universityId: string;
}

const SharedDocumentsView: React.FC<SharedDocumentsViewProps> = ({ universityId }) => {
  const { sharedDocuments, loading, updateDocumentStatus } = useSharedDocuments(universityId);
  const [selectedDocument, setSelectedDocument] = useState<SharedDocument | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'viewed':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (documentId: string, newStatus: 'pending' | 'viewed' | 'approved' | 'rejected') => {
    await updateDocumentStatus(documentId, newStatus, reviewNotes);
    setReviewNotes('');
    setSelectedDocument(null);
  };

  const handleDocumentView = async (document: SharedDocument) => {
    setSelectedDocument(document);
    
    // Mark as viewed if it's currently pending
    if (document.status === 'pending') {
      await updateDocumentStatus(document.id, 'viewed');
    }
  };

  const downloadDocument = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shared Student Documents</h2>
        <Badge variant="outline" className="text-sm">
          {sharedDocuments.length} documents
        </Badge>
      </div>

      {sharedDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-center">
              No documents have been shared with your university yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sharedDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {document.student_profiles?.full_name || 'Unknown Student'}
                    </CardTitle>
                    <CardDescription>
                      {document.student_profiles?.email}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {document.student_documents?.document_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({document.student_documents?.file_name})
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDocumentView(document)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Document Review</DialogTitle>
                            <DialogDescription>
                              Review and update the status of this document
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Student</label>
                                <p className="text-sm text-gray-600">
                                  {document.student_profiles?.full_name}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Document Type</label>
                                <p className="text-sm text-gray-600">
                                  {document.student_documents?.document_type}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Shared Date</label>
                                <p className="text-sm text-gray-600">
                                  {new Date(document.shared_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Current Status</label>
                                <Badge className={getStatusColor(document.status)}>
                                  {document.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Review Notes</label>
                              <Textarea
                                placeholder="Add notes about this document..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Update Status</label>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => handleStatusUpdate(document.id, 'viewed')}
                                >
                                  Mark as Viewed
                                </Button>
                                <Button
                                  variant="default"
                                  onClick={() => handleStatusUpdate(document.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(document.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {document.student_documents?.file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadDocument(
                              document.student_documents!.file_url,
                              document.student_documents!.file_name
                            )
                          }
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>

                  {document.university_notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Notes</span>
                      </div>
                      <p className="text-sm text-gray-600">{document.university_notes}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>
                      Shared: {new Date(document.shared_at).toLocaleDateString()}
                    </span>
                    {document.updated_at !== document.created_at && (
                      <span>
                        Updated: {new Date(document.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedDocumentsView;

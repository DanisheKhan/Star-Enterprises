import { useState } from 'react';
import { Modal, Button, Input } from '@/shared/ui';
import { useReviewLeaveRequest } from '../hooks/useStaff';
import { getErrorMessage } from '@/shared/lib/errors';
import { CheckCircle, XCircle } from 'lucide-react';

export function LeaveActionModal({ leave, isOpen, onClose }) {
  const reviewMutation = useReviewLeaveRequest();
  const [reviewNotes, setReviewNotes] = useState('');
  const [error, setError] = useState('');

  if (!leave) return null;

  const staff = leave.staff_profiles;

  async function handleAction(status) {
    setError('');
    try {
      await reviewMutation.mutateAsync({
        leaveId: leave.id,
        status,
        reviewNotes: reviewNotes.trim() || (status === 'approved' ? 'Leave approved by Store Owner' : 'Leave request declined due to store scheduling'),
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Leave: ${staff?.full_name}`}
      size="lg"
    >
      <div className="space-y-5 text-text min-w-0">
        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
            {error}
          </div>
        )}

        <div className="p-4 rounded-2xl border border-border bg-bg space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Staff Member:</span>
            <span className="font-semibold text-text">{staff?.full_name} ({staff?.employee_code})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Leave Type:</span>
            <span className="font-semibold text-text capitalize">{leave.leave_type} Leave</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Requested Duration:</span>
            <span className="font-semibold text-text">{leave.start_date} to {leave.end_date} ({leave.total_days} days)</span>
          </div>
          <div className="pt-2 border-t border-border">
            <span className="text-muted block mb-1">Reason provided by employee:</span>
            <p className="italic text-text bg-surface p-2.5 rounded-xl border border-border">
              "{leave.reason}"
            </p>
          </div>
        </div>

        <Input
          id="review-notes"
          label="Owner Decision Notes (Optional)"
          placeholder="e.g. Approved. Please ensure handover to Imran before leaving."
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
        />

        <div className="pt-3 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={() => handleAction('rejected')}
            pending={reviewMutation.isPending}
            className="bg-danger text-white hover:bg-danger/90 gap-1.5"
          >
            <XCircle size={15} /> Reject Request
          </Button>
          <Button
            variant="solid"
            onClick={() => handleAction('approved')}
            pending={reviewMutation.isPending}
            className="gap-1.5"
          >
            <CheckCircle size={15} /> Approve Leave
          </Button>
        </div>
      </div>
    </Modal>
  );
}

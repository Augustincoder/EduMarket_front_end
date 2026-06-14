import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { chatApi } from '../../services/chat.service';
import toast from 'react-hot-toast';

export default function TaskChatRedirect() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAndRedirect() {
      try {
        const response = await chatApi.getOrCreateTaskRoom(taskId);
        if (response.data && response.data.data) {
          navigate(`/chat/${response.data.data.id}`, { replace: true });
        } else {
          toast.error("Chat xonasi topilmadi");
          navigate(-1);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Chatga kirishda xatolik");
        navigate(-1);
      }
    }
    fetchAndRedirect();
  }, [taskId, navigate]);

  return <FullPageSpinner />;
}

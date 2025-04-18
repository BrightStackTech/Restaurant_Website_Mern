import { RiChatSmile3Fill } from 'react-icons/ri';

const ChatBotActionButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="fixed z-50 bottom-6 right-6 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg p-4 flex items-center justify-center transition-colors"
    style={{
      boxShadow: '0 4px 16px rgba(80,0,120,0.15)',
    }}
    aria-label="Open Chatbot"
  >
    <RiChatSmile3Fill size={32} className="text-white" />
  </button>
);

export default ChatBotActionButton;
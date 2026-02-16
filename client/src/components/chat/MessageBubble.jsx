import { Check, CheckCheck, Clock } from "lucide-react";

const StatusIcon = ({ status }) => {
  if (status === "sending")
    return <Clock size={11} className="text-zinc-600" />;
  if (status === "sent") return <Check size={11} className="text-zinc-500" />;
  if (status === "delivered")
    return <CheckCheck size={11} className="text-zinc-500" />;
  if (status === "seen")
    return <CheckCheck size={11} className="text-rose-400" />;
  return null;
};

const formatMsgTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MessageBubble = ({ message, isOwn, showAvatar, senderPhoto }) => {
  return (
    <div
      className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className="w-6 h-6 shrink-0">
        {!isOwn && showAvatar && (
          <div className="w-6 h-6 rounded-full overflow-hidden border border-zinc-700">
            {senderPhoto ? (
              <img
                src={senderPhoto}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-xs">
                👤
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[72%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}
      >
        <div
          className={`
            px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${
              isOwn
                ? "bg-linear-to-br from-rose-500 to-orange-500 text-white rounded-br-sm"
                : "bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700/50"
            }
          `}
        >
          {message.content}
        </div>

        {/* Time + status */}
        <div
          className={`flex items-center gap-1 mt-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="text-zinc-600 text-xs">
            {formatMsgTime(message.createdAt)}
          </span>
          {isOwn && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

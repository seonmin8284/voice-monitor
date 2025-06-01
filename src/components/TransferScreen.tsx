import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mic, Send, User, DollarSign } from "lucide-react";
import TransferMessage from "./TransferMessage";

// Web Speech API 타입 정의
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface WebkitSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionError) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface Window {
  webkitSpeechRecognition: new () => WebkitSpeechRecognition;
}

interface User {
  email: string;
  name: string;
}

interface Message {
  id: string;
  type: "user" | "system" | "transfer";
  content: string;
  timestamp: Date;
  transferData?: {
    receiver: string;
    amount: number;
    status: "processing" | "completed" | "failed";
  };
}

interface TransferScreenProps {
  user: User;
}

const TransferScreen = ({ user }: TransferScreenProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content: `안녕하세요 ${user.name}님! 음성 또는 텍스트로 송금을 요청해주세요.`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const parseTransferRequest = (text: string) => {
    // 간단한 패턴 매칭으로 송금 요청 파싱
    const patterns = [
      // "김민수에게 5만원 보내줘" 패턴
      /([가-힣]+)(?:에게|한테)\s*(\d+(?:만|천)?원?)?\s*(?:보내|송금|전송)/,
      // "5만원 김민수에게 보내줘" 패턴
      /(\d+(?:만|천)?원?)?\s*([가-힣]+)(?:에게|한테)\s*(?:보내|송금|전송)/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let receiver = "";
        let amountText = "";

        // 첫 번째 그룹이 한글이면 수신자, 아니면 금액
        if (match[1] && /[가-힣]/.test(match[1])) {
          receiver = match[1];
          amountText = match[2] || "";
        } else {
          receiver = match[2] || "";
          amountText = match[1] || "";
        }

        if (receiver) {
          let amount = 0;
          if (amountText) {
            const numMatch = amountText.match(/(\d+)/);
            if (numMatch) {
              amount = parseInt(numMatch[1]);
              if (amountText.includes("만")) {
                amount *= 10000;
              } else if (amountText.includes("천")) {
                amount *= 1000;
              }
            }
          }

          return { receiver, amount };
        }
      }
    }
    return null;
  };

  const sendTransactionData = async (transferData: {
    receiver: string;
    amount: number;
  }) => {
    try {
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction_id: Date.now(),
          amount: transferData.amount,
          card_type: "visa",
          timestamp: Math.floor(Date.now() / 1000),
          receiver: transferData.receiver,
          sender: user.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Transaction failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const transferData = parseTransferRequest(inputText);
    setInputText("");
    setIsProcessing(true);

    if (transferData) {
      try {
        const transferMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "transfer",
          content: `${
            transferData.receiver
          }님에게 ${transferData.amount.toLocaleString()}원을 송금합니다.`,
          timestamp: new Date(),
          transferData: {
            ...transferData,
            status: "processing",
          },
        };

        setMessages((prev) => [...prev, transferMessage]);

        // 백엔드로 거래 데이터 전송
        await sendTransactionData(transferData);

        // 송금 완료 처리
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === transferMessage.id
                ? {
                    ...msg,
                    transferData: { ...msg.transferData!, status: "completed" },
                  }
                : msg
            )
          );
        }, 3000);
      } catch (error) {
        // 에러 처리
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: "system",
          content: "송금 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } else {
      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content:
          '송금 요청을 이해하지 못했습니다. "김민수에게 5만원 보내줘"와 같이 말씀해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    }
    setIsProcessing(false);
    setTimeout(scrollToBottom, 100);
  };

  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("음성 인식이 지원되지 않는 브라우저입니다.");
      return;
    }

    setIsListening(true);

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    recognition.onerror = (error: SpeechRecognitionError) => {
      setIsListening(false);
      alert("음성 인식 중 오류가 발생했습니다.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="h-full flex flex-col">
      {/* 사용자 정보 */}
      <div className="p-4 bg-slate-50 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-slate-900">{user.name}</div>
            <div className="text-sm text-slate-500">잔액: 1,234,567원</div>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <TransferMessage key={message.id} message={message} />
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl p-3 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full loading-dots"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full loading-dots"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full loading-dots"></div>
                </div>
                <span className="text-slate-600 text-sm">처리 중...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="송금 요청을 입력하세요..."
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="pr-12"
            />
            <Button
              type="button"
              onClick={handleMicClick}
              disabled={isListening}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 rounded-full ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-slate-400 hover:bg-slate-500"
              }`}
            >
              <Mic className="w-4 h-4 text-white" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || isProcessing}
            className="bg-primary hover:bg-primary/90 w-10 h-10 p-0 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {isListening && (
          <div className="mt-2 text-center">
            <span className="text-sm text-red-500 animate-pulse">
              🎤 음성을 인식하고 있습니다...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferScreen;


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  isSignup?: boolean;
  onLogin: (email: string, name: string) => void;
  onSwitchToSignup: () => void;
}

const LoginScreen = ({ isSignup = false, onLogin, onSwitchToSignup }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 간단한 시뮬레이션 지연
    setTimeout(() => {
      const userName = isSignup ? name : email.split('@')[0];
      onLogin(email, userName);
      setIsLoading(false);
    }, 1500);
  };

  const handleDemoLogin = () => {
    onLogin('demo@voicepay.com', '김데모');
  };

  return (
    <div className="h-full flex flex-col justify-center px-8 py-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {isSignup ? '회원가입' : '로그인'}
        </h1>
        <p className="text-slate-600">
          {isSignup ? '음성 송금 서비스에 가입하세요' : '음성으로 간편하게 송금하세요'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              이름
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
              className="w-full"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            이메일
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            비밀번호
          </label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full loading-dots"></div>
                <div className="w-2 h-2 bg-white rounded-full loading-dots"></div>
                <div className="w-2 h-2 bg-white rounded-full loading-dots"></div>
              </div>
              처리 중...
            </div>
          ) : (
            isSignup ? '가입하기' : '로그인'
          )}
        </Button>
      </form>

      <div className="mt-6">
        <div className="flex items-center mb-4">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="px-4 text-sm text-slate-500">또는</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        <Button 
          onClick={handleDemoLogin}
          variant="outline" 
          className="w-full border-primary text-primary hover:bg-primary/5"
        >
          데모 계정으로 체험하기
        </Button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onSwitchToSignup}
          className="text-sm text-primary hover:underline"
        >
          {isSignup ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;

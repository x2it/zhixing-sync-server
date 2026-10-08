import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '@client/src/contexts/AuthContext';
import { recoverPassword } from '@client/src/api/auth';
import { logger } from '@lark-apaas/client-toolkit/logger';

type Mode = 'login' | 'recover';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<Mode>('login');

  // 登录表单
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 找回表单
  const [rUsername, setRUsername] = useState('');
  const [rCode, setRCode] = useState('');
  const [rNewPassword, setRNewPassword2] = useState('');
  const [rConfirm, setRConfirm] = useState('');
  const [rLoading, setRLoading] = useState(false);
  const [rError, setRError] = useState('');
  const [rSuccess, setRSuccess] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      logger.error('登录异常', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? '登录失败，请稍后重试')
          : '登录失败，请稍后重试';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rUsername.trim() || !rCode.trim() || !rNewPassword) {
      setRError('请填写完整信息');
      return;
    }
    if (rNewPassword.length < 8) {
      setRError('新密码至少需要 8 位字符');
      return;
    }
    if (rNewPassword !== rConfirm) {
      setRError('两次输入的新密码不一致');
      return;
    }
    setRLoading(true);
    setRError('');
    try {
      await recoverPassword(rUsername.trim(), rCode.trim(), rNewPassword);
      setRSuccess(true);
    } catch (err: unknown) {
      logger.error('恢复密码失败', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? '重置失败，请稍后重试')
          : '重置失败，请稍后重试';
      setRError(message);
    } finally {
      setRLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setRError('');
    setRSuccess(false);
  };

  // 终端风格：方角、1px 描边、等宽、聚焦磷光绿
  const inputCls =
    'w-full px-3 py-2 bg-background border border-border text-[13px] font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors';
  const labelCls = 'block text-[11px] text-muted-foreground mb-1.5 font-mono';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* 终端窗口 */}
        <div className="bg-card border border-border">
          {/* 标题栏 */}
          <div className="flex items-center gap-2 px-3 h-8 border-b border-border bg-background select-none">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="w-2 h-2 bg-destructive/70" />
              <span className="w-2 h-2 bg-warning/70" />
              <span className="w-2 h-2 bg-primary/70" />
            </span>
            <span className="flex-1 text-center text-[11px] text-muted-foreground font-mono truncate">
              ssh zx@zhixing-sync — 80×24
            </span>
          </div>

          <div className="p-6 sm:p-8">
            {/* ASCII 标题 */}
            <div className="mb-6">
              <pre className="font-mono text-[10px] leading-[1.15] text-primary whitespace-pre mb-4 overflow-x-auto">{String.raw`  ┌─┐┌─┐┌┬┐┌─┐┌─┐┌─┐┌┬┐
  │┌┘│└─┐ │ │└─┐├┬┘│ │├┤
  │└─┘└─┘ ┴ ┴└─┐┴└─┘└─┘└─┘`}</pre>
              <h1 className="text-lg text-foreground font-mono flex items-center gap-1.5">
                <span className="text-primary">知行同步助手</span>
                <span className="inline-block w-2 h-4 bg-primary term-cursor align-middle" aria-hidden="true" />
              </h1>
              {/* 工作台副标题与 APP 端 v2.7.13 定稿对齐：连接 · 记录 · 同步 */}
              <p className="text-[11px] text-primary/70 mt-1.5 font-mono tracking-wide">
                连接 · 记录 · 同步
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                {mode === 'login'
                  ? '// Only the next call. 专注下一通电话，其余交给系统。'
                  : '// 使用恢复码重置登录密码'}
              </p>
            </div>

            {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className={labelCls}>
                  <span className="text-primary">$</span> 用户名
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUsername(e.target.value)
                  }
                  placeholder="username"
                  className={inputCls}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className={labelCls}>
                  <span className="text-primary">$</span> 密码
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                  placeholder="••••••••"
                  className={inputCls}
                  disabled={loading}
                />
              </div>

              {error && (
                <p className="text-[12px] text-destructive font-mono">
                  <span className="text-destructive">[!]</span> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-primary text-primary-foreground text-[13px] font-mono hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '认证中...' : '> 登录'}
              </button>

              <button
                type="button"
                onClick={() => switchMode('recover')}
                className="w-full text-center text-[11px] text-muted-foreground hover:text-primary transition-colors font-mono"
              >
                [ 忘记密码？ ]
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecover} className="space-y-4">
              {rSuccess ? (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border border-primary flex items-center justify-center mx-auto">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-[13px] text-foreground font-mono">
                    <span className="text-primary">[+]</span> 密码已重置，该恢复码已失效。
                    <br />
                    请使用新密码登录。
                  </p>
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full py-2 bg-primary text-primary-foreground text-[13px] font-mono hover:bg-primary/90 transition-colors"
                  >
                    &gt; 返回登录
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="r-username" className={labelCls}>
                      <span className="text-primary">$</span> 用户名
                    </label>
                    <input
                      id="r-username"
                      type="text"
                      value={rUsername}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRUsername(e.target.value)
                      }
                      placeholder="username"
                      className={inputCls}
                      disabled={rLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="r-code" className={labelCls}>
                      <span className="text-primary">$</span> 恢复码
                    </label>
                    <input
                      id="r-code"
                      type="text"
                      value={rCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRCode(e.target.value)
                      }
                      placeholder="rc_xxxxxxxx"
                      className={inputCls}
                      disabled={rLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="r-new" className={labelCls}>
                      <span className="text-primary">$</span> 新密码
                    </label>
                    <input
                      id="r-new"
                      type="password"
                      value={rNewPassword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRNewPassword2(e.target.value)
                      }
                      placeholder="min 8 chars"
                      className={inputCls}
                      disabled={rLoading}
                    />
                  </div>

                  <div>
                    <label htmlFor="r-confirm" className={labelCls}>
                      <span className="text-primary">$</span> 确认新密码
                    </label>
                    <input
                      id="r-confirm"
                      type="password"
                      value={rConfirm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setRConfirm(e.target.value)
                      }
                      placeholder="repeat password"
                      className={inputCls}
                      disabled={rLoading}
                    />
                  </div>

                  {rError && (
                    <p className="text-[12px] text-destructive font-mono">
                      <span className="text-destructive">[!]</span> {rError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={rLoading}
                    className="w-full py-2 bg-primary text-primary-foreground text-[13px] font-mono hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rLoading ? '重置中...' : '> 重置密码'}
                  </button>

                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors font-mono"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    返回登录
                  </button>
                </>
              )}
            </form>
          )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-5 font-mono">
          © 2026 知行同步助手
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

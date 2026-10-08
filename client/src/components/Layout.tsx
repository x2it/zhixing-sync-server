import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  LayoutDashboard,
  Tags,
  Share2,
  Database,
  Code2,
  LogOut,
  MessageCircle,
  MessagesSquare,
  Palette,
  MoreHorizontal,
  X,
  KeyRound,
  Menu,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import ChangePasswordDialog from '@client/src/components/ChangePasswordDialog';
import { useAuth } from '@client/src/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string; strokeWidth?: number }>;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { to: '/contacts', label: '联系人', icon: Users },
  { to: '/communications', label: '沟通记录', icon: MessagesSquare },
  { to: '/tags', label: '标签', icon: Tags },
  { to: '/moments', label: '朋友圈', icon: Share2 },
  { to: '/data', label: '数据', icon: Database },
  { to: '/templates', label: '模板', icon: Palette },
  { to: '/api-docs', label: 'API', icon: Code2 },
];

const bottomNavItems: NavItem[] = [
  { to: '/dashboard', label: '首页', icon: LayoutDashboard },
  { to: '/contacts', label: '联系人', icon: Users },
  { to: '/communications', label: '沟通', icon: MessagesSquare },
  { to: '/moments', label: '朋友圈', icon: MessageCircle },
  { to: '/tags', label: '标签', icon: Tags },
];

const pageTitleMap: Record<string, string> = {
  '/dashboard': '仪表盘',
  '/contacts': '联系人',
  '/communications': '沟通记录',
  '/tags': '标签管理',
  '/moments': '朋友圈分组',
  '/data': '数据管理',
  '/templates': '模板方案',
  '/api-docs': 'API 接入',
};

/** 终端标识：ASCII 艺术字 + 光标块，替代原来的图标方块 */
const AsciiMark: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn(
      'font-mono font-bold leading-none text-primary select-none',
      className,
    )}
    style={{ letterSpacing: '-0.05em' }}
  >
    {'>_'}
  </span>
);

/** 终端光标：闪烁的小方块，纯装饰 */
const Cursor: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn('inline-block w-2 h-3.5 bg-primary align-middle term-cursor', className)}
    aria-hidden="true"
  />
);

/** 面包屑：终端路径风格 ~/contacts/...（移动端只显示当前页） */
const Breadcrumb: React.FC<{ current: string; className?: string }> = ({ current, className }) => (
  <nav
    aria-label="面包屑"
    className={cn('flex items-center gap-1.5 text-[11px] text-muted-foreground min-w-0 font-mono', className)}
  >
    <span className="text-primary/70 select-none">~</span>
    <NavLink to="/dashboard" className="hover:text-primary transition-colors shrink-0">
      home
    </NavLink>
    <ChevronRight className="w-3 h-3 shrink-0 opacity-50" strokeWidth={1.5} />
    <span className="text-primary truncate">{current}</span>
  </nav>
);

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTitle = pageTitleMap[location.pathname] ?? '知行同步助手';

  useEffect(() => {
    // 按页面动态 title；工作台页显示「连接 · 记录 · 同步」呼应 App 端 slogan
    document.title =
      location.pathname === '/dashboard'
        ? '知行同步助手 · 连接 · 记录 · 同步'
        : `${currentTitle} · 知行同步助手`;
  }, [location.pathname, currentTitle]);

  // 路由变化时自动收起所有浮层，避免"点了没反应/遮住内容"
  useEffect(() => {
    setDrawerOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  // 浮层打开时锁定页面滚动
  useEffect(() => {
    const locked = drawerOpen || moreOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen, moreOpen]);

  const handleLogout = () => {
    setMoreOpen(false);
    setDrawerOpen(false);
    logout();
    toast.success('已退出登录');
    navigate('/login', { replace: true });
  };

  const moreItems: Array<{ to: string; label: string; icon: React.FC<{ className?: string; strokeWidth?: number }> }> = [
    { to: '/data', label: '数据管理', icon: Database },
    { to: '/templates', label: '模板方案', icon: Palette },
    { to: '/api-docs', label: 'API 接入', icon: Code2 },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-mono">
      {/* Sidebar — 桌面端（终端风格：无毛玻璃，方角，扫描线） */}
      <aside
        className={`hidden md:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200 sticky top-0 self-start h-screen z-30 ${
          collapsed ? 'w-12' : 'w-[210px]'
        }`}
      >
        <div className="flex items-center h-12 px-3 border-b border-sidebar-border justify-between">
          <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0">
            <AsciiMark className="text-base" />
            {!collapsed && (
              <>
                <span className="text-[13px] text-foreground whitespace-nowrap truncate tracking-tight">
                  知行同步助手
                </span>
                <Cursor className="h-3 w-1.5" />
              </>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
              title="收起侧边栏"
            >
              <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <nav className="flex-1 py-2 px-1.5 space-y-px">
          {navItems.map((item: NavItem) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `win-nav-item flex items-center gap-2 px-2.5 py-1.5 text-[13px] transition-colors ${
                    isActive
                      ? 'win-nav-active bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex items-center justify-center px-2.5 py-1.5 text-muted-foreground hover:text-primary transition-colors"
              title="展开侧边栏"
            >
              <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
        </nav>

        <div className="px-1.5 pb-3 pt-2 border-t border-sidebar-border space-y-px">
          {!collapsed && user && (
            <div
              className="px-2.5 py-1 text-[11px] text-sidebar-foreground/45 truncate"
              title={user.username}
            >
              <span className="text-primary">@</span>
              {user.displayName || user.username}
            </div>
          )}
          <button
            onClick={() => setPwdOpen(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-sidebar-foreground/55 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground transition-colors"
            title={collapsed ? '修改密码' : undefined}
          >
            <KeyRound className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            {!collapsed && <span>修改密码</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[13px] text-sidebar-foreground/55 hover:bg-destructive/10 hover:text-destructive transition-colors"
            title={collapsed ? '退出登录' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            {!collapsed && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header — 桌面端（终端状态栏：路径提示 + 在线状态） */}
        <header className="hidden md:flex h-10 bg-background border-b border-border px-4 items-center justify-between gap-4 sticky top-0 z-30">
          <Breadcrumb current={currentTitle} />
          <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground">
            <span className="hidden lg:inline">sys.status:</span>
            <span className="text-primary">ONLINE</span>
            <span className="inline-block w-1.5 h-1.5 bg-primary term-cursor" aria-hidden="true" />
          </div>
        </header>

        {/* Header — 移动端：三明治菜单 + 品牌，下方面包屑 */}
        <header className="md:hidden sticky top-0 z-30 bg-background border-b border-border">
          <div className="flex h-11 px-3 items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 -ml-1 text-foreground hover:text-primary transition-colors"
                aria-label="打开菜单"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <div className="flex items-center gap-1.5 min-w-0">
                <AsciiMark className="text-sm" />
                <span className="text-[13px] text-foreground truncate">知行同步助手</span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-1.5">
            <Breadcrumb current={currentTitle} />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-5 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-5 min-w-0">
          <Outlet />
        </main>

        {/* Bottom Navigation — 移动端 */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 pb-[env(safe-area-inset-bottom)]">
          <div className="flex justify-around items-stretch h-14">
            {bottomNavItems.map((item: NavItem) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center flex-1 gap-0.5 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-[10px]">{item.label}</span>
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex flex-col items-center justify-center flex-1 gap-0.5 text-muted-foreground active:bg-accent transition-colors"
              aria-label="更多功能"
            >
              <MoreHorizontal className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[10px]">更多</span>
            </button>
          </div>
        </nav>
      </div>

      {/* 三明治抽屉 — 移动端全功能导航 */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 bottom-0 w-[78%] max-w-[300px] bg-sidebar border-r border-sidebar-border flex flex-col shadow-xl">
            <div className="flex items-center justify-between h-12 px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-1.5 min-w-0">
                <AsciiMark className="text-sm" />
                <span className="text-[13px] text-foreground truncate">知行同步助手</span>
                <Cursor className="h-3 w-1.5" />
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                aria-label="关闭菜单"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {navItems.map((item: NavItem) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `win-nav-item flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'win-nav-active bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      }`
                    }
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <div className="px-2 pb-4 pt-2 border-t border-sidebar-border space-y-1">
              {user && (
                <div className="px-3 py-1.5 text-xs text-muted-foreground truncate">
                  {user.displayName || user.username}
                </div>
              )}
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setPwdOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
              >
                <KeyRound className="w-4.5 h-4.5 shrink-0" strokeWidth={1.5} />
                <span>修改密码</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0" strokeWidth={1.5} />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 更多功能 — 移动端底部抽屉 */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMoreOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 bg-background border-t border-border rounded-t-2xl shadow-xl pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <span className="text-sm font-medium text-foreground">更多功能</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                aria-label="关闭"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="px-4 pb-2">
              <div className="grid grid-cols-3 gap-3">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMoreOpen(false)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-muted hover:bg-accent transition-colors"
                    >
                      <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                      <span className="text-[11px] text-foreground/80">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
            <div className="px-4 py-3 border-t border-border space-y-1">
              {user && (
                <div className="text-center text-xs text-muted-foreground pb-1">
                  {user.displayName || user.username}
                </div>
              )}
              <button
                onClick={() => {
                  setMoreOpen(false);
                  setPwdOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm text-foreground hover:bg-accent transition-colors"
              >
                <KeyRound className="w-4 h-4" strokeWidth={1.5} />
                修改密码
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
                退出登录
              </button>
            </div>
          </div>
        </div>
      )}

      <ChangePasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />
    </div>
  );
};

export default Layout;

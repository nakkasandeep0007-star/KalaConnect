import React from 'react';
import {
  LayoutDashboard,
  User,
  FolderHeart,
  ShoppingBag,
  PlusCircle,
  FileText,
  Inbox,
  MessageSquare,
  BadgeIndianRupee,
  Settings,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Camera,
  Languages,
  Store,
  Building2,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { LanguageCode, PageTab } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: PageTab;
  setCurrentTab: (tab: PageTab) => void;
  currentLang: LanguageCode;
  onOpenQuickVoiceGuide: () => void;
  pendingRequestsCount?: number;
  activeOrdersCount?: number;
  unreadMessagesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentLang,
  onOpenQuickVoiceGuide,
  pendingRequestsCount = 0,
  activeOrdersCount = 0,
  unreadMessagesCount = 0,
}) => {
  const { role } = useAuth();
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Artisan navigation items
  const artistNavItems = [
    {
      id: 'dashboard' as PageTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Overview & Metrics',
    },
    {
      id: 'b2b-marketplace' as PageTab,
      label: 'B2B Marketplace',
      icon: Store,
      desc: 'Wholesale & Direct RFQs',
    },
    {
      id: 'profile' as PageTab,
      label: 'Profile',
      icon: User,
      desc: 'Craftmark & Bio',
    },
    {
      id: 'previous-work' as PageTab,
      label: 'Previous Work',
      icon: FolderHeart,
      desc: 'Portfolio & Heritage',
    },
    {
      id: 'catalog-generator' as PageTab,
      label: 'KalaCatalog AI',
      icon: Languages,
      desc: 'Multilingual Copy & Tags',
    },
    {
      id: 'catalog' as PageTab,
      label: 'My Catalog',
      icon: ShoppingBag,
      desc: 'Inventory & Listings',
    },
    {
      id: 'add-product' as PageTab,
      label: 'Add Product',
      icon: PlusCircle,
      highlight: true,
      desc: '5-Step AI Wizard',
    },
    {
      id: 'orders' as PageTab,
      label: 'Orders',
      icon: FileText,
      badge: activeOrdersCount > 0 ? `${activeOrdersCount}` : null,
      desc: 'Custom Progress & Milestones',
    },
    {
      id: 'requests' as PageTab,
      label: 'Artisan Requests',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null,
      badgeColor: 'bg-amber-500 text-white',
      desc: 'B2B RFQs & Commissions',
    },
    {
      id: 'messages' as PageTab,
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : null,
      desc: 'Buyer Chat',
    },
    {
      id: 'earnings' as PageTab,
      label: 'Earnings',
      icon: BadgeIndianRupee,
      desc: 'Bank & UPI Payouts',
    },
    {
      id: 'settings' as PageTab,
      label: 'Settings',
      icon: Settings,
      desc: 'Language & Account',
    },
  ];

  // Buyer navigation items
  const buyerNavItems = [
    {
      id: 'dashboard' as PageTab,
      label: 'Buyer Dashboard',
      icon: LayoutDashboard,
      desc: 'Bulk sourcing overview',
    },
    {
      id: 'b2b-marketplace' as PageTab,
      label: 'B2B Marketplace',
      icon: Store,
      highlight: true,
      desc: 'Direct artisan catalog',
    },
    {
      id: 'requests' as PageTab,
      label: 'My RFQs & Quotes',
      icon: Send,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null,
      badgeColor: 'bg-slate-900 text-white',
      desc: 'Track quotes and offers',
    },
    {
      id: 'profile' as PageTab,
      label: 'Business Profile',
      icon: Building2,
      desc: 'Buyer organization info',
    },
    {
      id: 'messages' as PageTab,
      label: 'Artisan Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : null,
      desc: 'Direct negotiation',
    },
    {
      id: 'settings' as PageTab,
      label: 'Account Settings',
      icon: Settings,
      desc: 'Preferences & Notifications',
    },
  ];

  const currentNavItems = role === 'buyer' ? buyerNavItems : artistNavItems;

  // Mobile navigation subset
  const mobileNavItems =
    role === 'buyer'
      ? [
          { id: 'dashboard' as PageTab, label: 'Dashboard', icon: LayoutDashboard },
          { id: 'b2b-marketplace' as PageTab, label: 'Marketplace', icon: Store, highlight: true },
          { id: 'requests' as PageTab, label: 'My RFQs', icon: Send, badge: pendingRequestsCount },
          { id: 'profile' as PageTab, label: 'Profile', icon: Building2 },
        ]
      : [
          { id: 'dashboard' as PageTab, label: 'Home', icon: LayoutDashboard },
          { id: 'catalog' as PageTab, label: 'Catalog', icon: ShoppingBag },
          { id: 'add-product' as PageTab, label: 'Add Product', icon: PlusCircle, highlight: true },
          { id: 'requests' as PageTab, label: 'Requests', icon: Inbox, badge: pendingRequestsCount },
          { id: 'orders' as PageTab, label: 'Orders', icon: FileText },
        ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-stone-200 min-h-[calc(100vh-5rem)] p-4 justify-between shrink-0">
        <div className="space-y-4">
          
          {/* Quick Creation CTA for Artisans vs Sourcing CTA for Buyers */}
          {role === 'buyer' ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-stone-900 text-white shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 rounded-md bg-white/20 text-white">
                  <Store className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-white">B2B Sourcing Hub</span>
              </div>
              <p className="text-[11px] text-stone-300 mb-3 leading-relaxed">
                Direct wholesale orders with verified master artisans.
              </p>
              <button
                onClick={() => setCurrentTab('b2b-marketplace')}
                id="sidebar-browse-b2b-btn"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
              >
                <Store className="w-4 h-4" />
                <span>Browse Wholesale Catalog</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#C25E3E]/10 via-[#FAF7F2] to-amber-50/50 border border-[#C25E3E]/20 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1 rounded-md bg-[#C25E3E] text-white">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-bold text-slate-900">Artist Suite</span>
              </div>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                Photo → Voice → Fair Price → Sell
              </p>
              <button
                onClick={() => setCurrentTab('add-product')}
                id="sidebar-create-product-btn"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#C25E3E] hover:bg-[#A94B2E] text-white text-xs font-bold shadow-md shadow-[#C25E3E]/20 transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add New Product</span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              {role === 'buyer' ? 'Buyer Menu' : 'Artisan Menu'}
            </div>
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  id={`sidebar-link-${item.id}`}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 font-semibold'
                      : 'text-stone-700 hover:bg-stone-100/90 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-[#E07A5F]'
                          : item.highlight
                          ? 'text-[#C25E3E]'
                          : 'text-stone-400 group-hover:text-stone-700'
                      }`}
                    />
                    <div className="text-left truncate">
                      <span className="block truncate">{item.label}</span>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight shrink-0 ${
                        item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Voice Guide Helper */}
        <div className="pt-4 border-t border-stone-200">
          <button
            onClick={onOpenQuickVoiceGuide}
            className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#C25E3E] shrink-0" />
            <span className="truncate">Voice Help Guide</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Fixed Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2 flex items-center justify-around shadow-lg">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-colors relative ${
                isActive ? 'text-[#C25E3E]' : 'text-stone-500 hover:text-slate-900'
              }`}
            >
              {item.highlight ? (
                <div className="w-8 h-8 rounded-full bg-[#C25E3E] text-white flex items-center justify-center -mt-4 shadow-md shadow-[#C25E3E]/30">
                  <Icon className="w-4 h-4" />
                </div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="mt-0.5">{item.label}</span>
              {Boolean(item.badge) && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};

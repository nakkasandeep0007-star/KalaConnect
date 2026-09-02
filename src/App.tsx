import React, { useState, useEffect } from 'react';
import {
  ArtisanProfile,
  Conversation,
  CustomOrder,
  CustomerRequest,
  LanguageCode,
  PageTab,
  PreviousWork,
  Product,
  UserRole,
  B2BQuoteRequest,
  B2BRequestStatus,
} from './types';
import {
  INITIAL_PRODUCTS,
} from './data/mockData';
import {
  SAMPLE_PREVIOUS_WORKS,
  SAMPLE_CUSTOMER_REQUESTS,
  SAMPLE_ORDERS,
  SAMPLE_CONVERSATIONS,
} from './data/sampleArtistData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { VoiceHelperWidget } from './components/VoiceHelperWidget';
import { WelcomeLanding } from './components/pages/WelcomeLanding';
import { OnboardingPage } from './components/pages/OnboardingPage';
import { AuthPage } from './components/pages/AuthPage';
import { RoleSelectionPage } from './components/pages/RoleSelectionPage';
import { CustomerPortalPage } from './components/pages/CustomerPortalPage';
import { Dashboard } from './components/pages/Dashboard';
import { AddProductWizard } from './components/pages/AddProductWizard';
import { KalaStudioPage } from './components/pages/KalaStudioPage';
import { KalaCatalogPage } from './components/pages/KalaCatalogPage';
import { KalaPricePage } from './components/pages/KalaPricePage';
import { MyCatalogPage } from './components/pages/MyCatalogPage';
import { PreviousWorkPage } from './components/pages/PreviousWorkPage';
import { CustomerRequestsPage } from './components/pages/CustomerRequestsPage';
import { MessagesPage } from './components/pages/MessagesPage';
import { OrdersPage } from './components/pages/OrdersPage';
import { EarningsPage } from './components/pages/EarningsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { B2BMarketplacePage } from './components/pages/B2BMarketplacePage';
import { BuyerDashboardPage } from './components/pages/BuyerDashboardPage';
import { BuyerRequestsPage } from './components/pages/BuyerRequestsPage';
import { BuyerProfilePage } from './components/pages/BuyerProfilePage';
import { ProductDetailModal } from './components/modals/ProductDetailModal';
import { B2BListingModal } from './components/modals/B2BListingModal';
import { RequestQuoteModal } from './components/modals/RequestQuoteModal';
import { SendOfferModal } from './components/modals/SendOfferModal';
import { useAuth } from './context/AuthContext';
import { getUserProducts, saveProductToDb } from './services/productService';
import { getUserPreviousWorks } from './services/previousWorkService';
import { getArtistRequests } from './services/customerRequestService';
import { getArtistOrders } from './services/orderService';
import { getArtistConversations } from './services/conversationService';
import { getB2BRequests, saveB2BRequestToDb, updateB2BRequestStatusInDb } from './services/b2bRequestService';

export const App: React.FC = () => {
  const { user, role, artisan: authArtisan, buyerProfile, loading: authLoading, updateProfileData } = useAuth();

  // Active role strictly derived from authenticated session
  const effectiveRole: 'artisan' | 'buyer' | null = user ? role : null;
  const effectiveArtisan: ArtisanProfile | null = user && role === 'artisan' ? authArtisan : null;

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<PageTab>(() => {
    const savedSession = localStorage.getItem('kalaconnect_current_session');
    if (savedSession) return 'dashboard';
    return 'auth';
  });

  const [currentLang, setCurrentLang] = useState<LanguageCode>('en');
  const [isVoiceHelperOpen, setIsVoiceHelperOpen] = useState(false);

  // App Domain State (Only loaded when authenticated)
  const [products, setProducts] = useState<Product[]>([]);
  const [previousWorks, setPreviousWorks] = useState<PreviousWork[]>([]);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [b2bRequests, setB2bRequests] = useState<B2BQuoteRequest[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Modal inspection states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [priceEditingProductId, setPriceEditingProductId] = useState<string | null>(null);

  // B2B Modal states
  const [b2bListingProduct, setB2bListingProduct] = useState<Product | null>(null);
  const [requestQuoteProduct, setRequestQuoteProduct] = useState<Product | null>(null);
  const [sendOfferRequest, setSendOfferRequest] = useState<B2BQuoteRequest | null>(null);

  // Synchronize language if artisan preferredLanguage is set
  useEffect(() => {
    if (effectiveArtisan?.preferredLanguage) {
      setCurrentLang(effectiveArtisan.preferredLanguage);
    }
  }, [effectiveArtisan]);

  // Load domain data strictly when user is authenticated
  useEffect(() => {
    let isMounted = true;

    if (!user) {
      // User is logged out — Reset all private artisan/buyer data
      setPreviousWorks([]);
      setRequests([]);
      setOrders([]);
      setConversations([]);
      setB2bRequests([]);
      // Load canonical products for public exploration and marketplace preview
      getUserProducts().then((allProds) => {
        if (isMounted) {
          setProducts(allProds.length > 0 ? allProds : INITIAL_PRODUCTS);
        }
      });
      return;
    }

    async function loadAllData() {
      if (!user) return;
      setLoadingData(true);
      const userId = user.uid;

      try {
        const [dbProducts, dbWorks, dbRequests, dbOrders, dbConvs, dbB2BReqs] = await Promise.all([
          getUserProducts(userId),
          getUserPreviousWorks(userId),
          getArtistRequests(userId),
          getArtistOrders(userId),
          getArtistConversations(userId),
          getB2BRequests(userId),
        ]);

        if (isMounted) {
          setProducts(dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS);
          setPreviousWorks(dbWorks.length > 0 ? dbWorks : SAMPLE_PREVIOUS_WORKS);
          setRequests(dbRequests.length > 0 ? dbRequests : SAMPLE_CUSTOMER_REQUESTS);
          setOrders(dbOrders.length > 0 ? dbOrders : SAMPLE_ORDERS);
          setConversations(dbConvs.length > 0 ? dbConvs : SAMPLE_CONVERSATIONS);
          setB2bRequests(dbB2BReqs);
        }
      } catch (err) {
        console.error('Error loading domain data:', err);
        if (isMounted) {
          setProducts(INITIAL_PRODUCTS);
          setPreviousWorks(SAMPLE_PREVIOUS_WORKS);
          setRequests(SAMPLE_CUSTOMER_REQUESTS);
          setOrders(SAMPLE_ORDERS);
          setConversations(SAMPLE_CONVERSATIONS);
        }
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    loadAllData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Handle new product creation from wizard
  const handleProductCreated = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
  };

  // B2B Wholesale Handlers
  const handleSaveB2BListing = async (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    const userId = user?.uid || 'guest-artisan';
    try {
      await saveProductToDb(userId, updatedProduct);
    } catch (err) {
      console.warn('Failed to save B2B listing:', err);
    }
  };

  const handleCreateB2BQuoteRequest = async (requestData: Omit<B2BQuoteRequest, 'id' | 'createdAt' | 'status'>) => {
    try {
      const created = await saveB2BRequestToDb(requestData);
      setB2bRequests((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      return created;
    } catch (err) {
      console.error('Failed to create B2B quote request:', err);
    }
  };

  const handleSendB2BOffer = async (
    requestId: string,
    offer: { offeredPrice: number; offeredDeliveryDays: number; message?: string }
  ) => {
    try {
      await updateB2BRequestStatusInDb(requestId, 'Offer Sent', {
        offeredPrice: offer.offeredPrice,
        offeredDeliveryDays: offer.offeredDeliveryDays,
        artisanOfferMessage: offer.message,
      });
      setB2bRequests((prev) =>
        prev.map((r) =>
          r.id === requestId || r.requestId === requestId
            ? {
                ...r,
                status: 'Offer Sent',
                offeredPrice: offer.offeredPrice,
                offeredDeliveryDays: offer.offeredDeliveryDays,
                artisanOfferMessage: offer.message,
                offeredAt: new Date().toISOString(),
              }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to send B2B offer:', err);
    }
  };

  const handleUpdateB2BStatus = async (
    requestId: string,
    status: B2BRequestStatus,
    details?: any
  ) => {
    try {
      await updateB2BRequestStatusInDb(requestId, status, details);
      setB2bRequests((prev) =>
        prev.map((r) =>
          r.id === requestId || r.requestId === requestId
            ? {
                ...r,
                status,
                ...(details || {}),
              }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to update B2B request status:', err);
    }
  };

  // Scroll to top upon tab transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  // Protected route check: If user is logged out and tries to access protected views, show AuthPage
  const isPublicTab =
    currentTab === 'auth' ||
    currentTab === 'role-selection' ||
    currentTab === 'customer-portal' ||
    currentTab === 'welcome' ||
    currentTab === 'b2b-marketplace';

  // If user is not authenticated and is on a protected tab, render AuthPage
  const shouldRenderAuth = !user && !isPublicTab;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans flex flex-col selection:bg-[#C25E3E] selection:text-white">
      
      {/* 1. Auth Page (Standalone Full View) */}
      {(currentTab === 'auth' || shouldRenderAuth) && (
        <div className="min-h-screen flex flex-col justify-between py-6 px-4 bg-[#FDFBF7]">
          <div className="flex justify-between items-center max-w-lg mx-auto w-full mb-2">
            <button
              onClick={() => setCurrentTab('b2b-marketplace')}
              className="text-xs font-bold text-stone-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>🏪 Browse Public Marketplace</span>
            </button>
          </div>
          <AuthPage
            initialRole={effectiveRole === 'buyer' ? 'buyer' : 'artisan'}
            onSuccess={(signedUpRole) => {
              setCurrentTab('dashboard');
            }}
          />
          <div className="text-center text-xs text-stone-400 mt-6">
            KalaConnect • Connecting Tradition to Opportunity
          </div>
        </div>
      )}

      {/* 2. Public Role Selection */}
      {currentTab === 'role-selection' && !shouldRenderAuth && (
        <RoleSelectionPage
          onSelectRole={(selected) => {
            if (selected === 'customer') {
              setCurrentTab('customer-portal');
            } else {
              setCurrentTab('auth');
            }
          }}
          selectedRole={effectiveRole}
        />
      )}

      {/* 3. Customer Portal */}
      {currentTab === 'customer-portal' && !shouldRenderAuth && (
        <CustomerPortalPage
          products={products.length > 0 ? products : INITIAL_PRODUCTS}
          b2bRequests={b2bRequests}
          onOpenRequestQuote={(prod) => {
            if (!user) {
              setCurrentTab('auth');
            } else {
              setRequestQuoteProduct(prod);
            }
          }}
          onSelectProduct={setSelectedProduct}
          onBackToRoleSelection={() => {
            setCurrentTab('auth');
          }}
          onUpdateB2BRequestStatus={handleUpdateB2BStatus}
        />
      )}

      {/* 4. Welcome Landing */}
      {currentTab === 'welcome' && !shouldRenderAuth && (
        <WelcomeLanding
          setCurrentTab={setCurrentTab}
          currentLang={currentLang}
          onOpenQuickVoiceGuide={() => setIsVoiceHelperOpen(true)}
        />
      )}

      {/* 5. Main Authenticated App Shell & Public Marketplace */}
      {!shouldRenderAuth && currentTab !== 'auth' && currentTab !== 'role-selection' && currentTab !== 'customer-portal' && currentTab !== 'welcome' && (
        <div className="flex flex-col min-h-screen">
          {/* Top Navbar */}
          <Navbar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            currentLang={currentLang}
            setCurrentLang={setCurrentLang}
            artisan={effectiveArtisan}
            unreadInquiriesCount={
              effectiveRole === 'buyer'
                ? b2bRequests.filter((r) => r.status === 'Offer Sent' || r.status === 'In Review').length
                : requests.filter((r) => r.status === 'pending').length
            }
            onOpenVoiceHelper={() => setIsVoiceHelperOpen(true)}
          />

          <div className="flex-1 flex w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 gap-6">
            {/* Sidebar Navigation — Rendered when authenticated */}
            {user && (
              <Sidebar
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                currentLang={currentLang}
                onOpenQuickVoiceGuide={() => setIsVoiceHelperOpen(true)}
                pendingRequestsCount={
                  effectiveRole === 'buyer'
                    ? b2bRequests.filter((r) => r.status === 'Offer Sent' || r.status === 'In Review').length
                    : requests.filter((r) => r.status === 'pending').length
                }
                activeOrdersCount={orders.filter((o) => o.status !== 'completed' && o.status !== 'delivered').length}
                unreadMessagesCount={conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}
              />
            )}

            {/* Main Dynamic Viewport */}
            <main className="flex-1 min-w-0 pb-20 md:pb-6">
              
              {/* Dashboard */}
              {currentTab === 'dashboard' && (
                effectiveRole === 'buyer' ? (
                  <BuyerDashboardPage
                    products={products}
                    b2bRequests={b2bRequests}
                    setCurrentTab={setCurrentTab}
                    onOpenRequestQuote={(prod) => setRequestQuoteProduct(prod)}
                    onSelectProduct={setSelectedProduct}
                    onUpdateB2BRequestStatus={handleUpdateB2BStatus}
                  />
                ) : effectiveArtisan ? (
                  <Dashboard
                    artisan={effectiveArtisan}
                    products={products}
                    previousWorks={previousWorks}
                    requests={requests}
                    orders={orders}
                    conversations={conversations}
                    setCurrentTab={setCurrentTab}
                    currentLang={currentLang}
                    setSelectedProduct={setSelectedProduct}
                  />
                ) : null
              )}

              {/* Profile */}
              {currentTab === 'profile' && (
                effectiveRole === 'buyer' ? (
                  <BuyerProfilePage />
                ) : effectiveArtisan ? (
                  <ProfilePage
                    artisan={effectiveArtisan}
                    setArtisan={(updated) => updateProfileData(typeof updated === 'function' ? updated(effectiveArtisan) : updated)}
                    currentLang={currentLang}
                    setCurrentLang={setCurrentLang}
                    setCurrentTab={setCurrentTab}
                  />
                ) : null
              )}

              {/* Previous Work */}
              {currentTab === 'previous-work' && (
                <PreviousWorkPage
                  previousWorks={previousWorks}
                  setPreviousWorks={setPreviousWorks}
                  currentLang={currentLang}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {/* My Catalog */}
              {(currentTab === 'catalog' || currentTab === 'products') && (
                <MyCatalogPage
                  products={products}
                  setProducts={setProducts}
                  setSelectedProduct={setSelectedProduct}
                  setCurrentTab={setCurrentTab}
                  currentLang={currentLang}
                  onEditPrice={(prod) => {
                    setPriceEditingProductId(prod.id);
                    setCurrentTab('pricing');
                  }}
                  onListB2B={(prod) => setB2bListingProduct(prod)}
                />
              )}

              {/* B2B Wholesale Marketplace */}
              {(currentTab === 'b2b-marketplace' || currentTab === 'b2b') && (
                <B2BMarketplacePage
                  products={products.length > 0 ? products : INITIAL_PRODUCTS}
                  b2bRequests={b2bRequests}
                  onOpenRequestQuote={(prod) => {
                    if (!user) {
                      setCurrentTab('auth');
                    } else {
                      setRequestQuoteProduct(prod);
                    }
                  }}
                  onOpenSendOffer={(req) => setSendOfferRequest(req)}
                  onOpenB2BListingModal={(prod) => setB2bListingProduct(prod)}
                  onSelectProduct={setSelectedProduct}
                  setCurrentTab={setCurrentTab}
                  currentLang={currentLang}
                  artisan={effectiveArtisan}
                  onUpdateB2BRequestStatus={handleUpdateB2BStatus}
                />
              )}

              {/* Add Product 5-Step Guided Wizard */}
              {currentTab === 'add-product' && effectiveArtisan && (
                <AddProductWizard
                  artisan={effectiveArtisan}
                  onProductCreated={handleProductCreated}
                  setCurrentTab={setCurrentTab}
                  currentLang={currentLang}
                />
              )}

              {/* KalaStudio Direct Tool */}
              {currentTab === 'studio' && (
                <KalaStudioPage
                  setCurrentTab={setCurrentTab}
                  currentLang={currentLang}
                />
              )}

              {/* KalaCatalog Multilingual AI Generator */}
              {(currentTab === 'catalog-generator' || currentTab === 'ai-catalog') && effectiveArtisan && (
                <KalaCatalogPage
                  setCurrentTab={setCurrentTab}
                  currentLang={currentLang}
                  artisan={effectiveArtisan}
                  onProductSaved={handleProductCreated}
                />
              )}

              {/* KalaPrice Direct Tool */}
              {currentTab === 'pricing' && (
                <KalaPricePage
                  setCurrentTab={setCurrentTab}
                  currentLang={currentLang}
                  products={products}
                  setProducts={setProducts}
                  initialProductId={priceEditingProductId}
                />
              )}

              {/* Orders & Artwork Progress Tracker */}
              {currentTab === 'orders' && (
                <OrdersPage
                  orders={orders}
                  setOrders={setOrders}
                  setCurrentTab={setCurrentTab}
                  currentLang={currentLang}
                />
              )}

              {/* Customer Requests or Buyer RFQs */}
              {currentTab === 'requests' && (
                effectiveRole === 'buyer' ? (
                  <BuyerRequestsPage
                    b2bRequests={b2bRequests}
                    setCurrentTab={setCurrentTab}
                    onOpenRequestQuote={(prod) => setRequestQuoteProduct(prod)}
                    onUpdateB2BRequestStatus={handleUpdateB2BStatus}
                  />
                ) : (
                  <CustomerRequestsPage
                    requests={requests}
                    setRequests={setRequests}
                    setCurrentTab={setCurrentTab}
                    currentLang={currentLang}
                    b2bRequests={b2bRequests}
                    onOpenSendOffer={(req) => setSendOfferRequest(req)}
                    onUpdateB2BStatus={handleUpdateB2BStatus}
                  />
                )
              )}

              {/* Messages & Chat */}
              {currentTab === 'messages' && (
                <MessagesPage
                  conversations={conversations}
                  setConversations={setConversations}
                  requests={requests}
                  setCurrentTab={setCurrentTab}
                  currentLang={currentLang}
                />
              )}

              {/* Earnings & UPI Disbursements */}
              {currentTab === 'earnings' && (
                <EarningsPage
                  orders={orders}
                  products={products}
                  currentLang={currentLang}
                  setCurrentTab={setCurrentTab}
                />
              )}

              {/* Settings & Role Switch */}
              {currentTab === 'settings' && (
                <SettingsPage
                  currentLang={currentLang}
                  setCurrentLang={setCurrentLang}
                  setCurrentTab={setCurrentTab}
                  onSwitchRole={() => {
                    setCurrentTab('auth');
                  }}
                />
              )}

            </main>
          </div>
        </div>
      )}

      {/* Voice Assistant Audio Guide Modal */}
      <VoiceHelperWidget
        isOpen={isVoiceHelperOpen}
        onClose={() => setIsVoiceHelperOpen(false)}
        currentLang={currentLang}
        onStartWorkflow={() => {
          setIsVoiceHelperOpen(false);
          setCurrentTab('add-product');
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        currentLang={currentLang}
        onEditPrice={(prod) => {
          setPriceEditingProductId(prod.id);
          setCurrentTab('pricing');
        }}
      />

      {/* B2B Listing Modal for Artisans */}
      <B2BListingModal
        product={b2bListingProduct}
        isOpen={Boolean(b2bListingProduct)}
        onClose={() => setB2bListingProduct(null)}
        onSave={handleSaveB2BListing}
        currentLang={currentLang}
      />

      {/* B2B Request Quote Modal for Wholesale Buyers */}
      <RequestQuoteModal
        product={requestQuoteProduct}
        isOpen={Boolean(requestQuoteProduct)}
        onClose={() => setRequestQuoteProduct(null)}
        onSubmit={handleCreateB2BQuoteRequest}
      />

      {/* B2B Send Offer Modal for Artisans */}
      <SendOfferModal
        request={sendOfferRequest}
        isOpen={Boolean(sendOfferRequest)}
        onClose={() => setSendOfferRequest(null)}
        onSendOffer={handleSendB2BOffer}
      />
    </div>
  );
};

export default App;

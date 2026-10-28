import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Item, Match, Notification } from './types';
import { apiClient } from './api/client';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ItemExplorer } from './components/ItemExplorer';
import { SmartMatchmaker } from './components/SmartMatchmaker';
import { StudentActivity } from './components/StudentActivity';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportModal } from './components/ReportModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ClaimModal } from './components/ClaimModal';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { NotificationPopup } from './components/NotificationPopup';

const getStoredAuth = () => {
  try {
    const raw = localStorage.getItem('lostfound_auth');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupted item
  }
  return null;
};

export const App: React.FC = () => {
  const initialAuth = getStoredAuth();
  const [activeTab, setActiveTab] = useState<'directory' | 'matches' | 'activity' | 'admin'>('directory');
  const [items, setItems] = useState<Item[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUser, setCurrentUser] = useState<string>(initialAuth?.email || '');
  const [currentUserName, setCurrentUserName] = useState<string>(initialAuth?.name || '');
  const [userRole, setUserRole] = useState<'STUDENT' | 'ADMIN'>(initialAuth?.role || 'STUDENT');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!(initialAuth && initialAuth.email));

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [activePopupNotification, setActivePopupNotification] = useState<Notification | null>(null);

  const knownNotificationIdsRef = useRef<Set<number>>(new Set());
  const initialLoadDoneRef = useRef<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<'LOST' | 'FOUND'>('LOST');
  const [inspectItem, setInspectItem] = useState<Item | null>(null);

  // Claiming Modal
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimTargetItem, setClaimTargetItem] = useState<Item | null>(null);

  // Auth Modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Pending Claims Count
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);

  const refreshAllData = useCallback(async () => {
    try {
      const [fetchedItems, fetchedMatches, claims] = await Promise.all([
        apiClient.getItems({
          q: searchQuery,
          category: selectedCategory,
          type: selectedType,
          status: selectedStatus,
          sortBy: sortBy
        }),
        apiClient.getMatches(),
        apiClient.getAllClaims('PENDING')
      ]);
      setItems(fetchedItems);
      setMatches(fetchedMatches);
      setPendingClaimsCount(claims.length);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }, [searchQuery, selectedCategory, selectedType, selectedStatus, sortBy]);

  const fetchUserNotifications = useCallback(async () => {
    const activeEmail = currentUser || getStoredAuth()?.email;
    if (!activeEmail) {
      setNotifications([]);
      return;
    }
    try {
      const list = await apiClient.getNotifications(activeEmail);
      setNotifications(list);

      // Automatically pop up new or action notifications with sound
      if (!initialLoadDoneRef.current) {
        list.forEach(n => knownNotificationIdsRef.current.add(n.id));
        initialLoadDoneRef.current = true;
        // If there is an unresolved action notification on load, pop it up
        const pendingAction = list.find(n => !n.read && n.requiresAction);
        if (pendingAction) {
          setActivePopupNotification(pendingAction);
        }
      } else {
        const newArrivals = list.filter(n => !knownNotificationIdsRef.current.has(n.id) && !n.read);
        if (newArrivals.length > 0) {
          newArrivals.forEach(n => knownNotificationIdsRef.current.add(n.id));
          // Pop up the newest incoming alert with sound!
          setActivePopupNotification(newArrivals[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    fetchUserNotifications();
    const timer = setInterval(fetchUserNotifications, 5000); // Poll notifications every 5s for rapid alerts
    return () => clearInterval(timer);
  }, [fetchUserNotifications]);

  // Actions
  const handleOpenReportModal = (type: 'LOST' | 'FOUND') => {
    const stored = getStoredAuth();
    const activeEmail = currentUser || stored?.email;

    // Ask for login ONLY if user is not currently logged in or registered
    if (!isLoggedIn && !activeEmail) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    if (!isLoggedIn && stored) {
      setIsLoggedIn(true);
      setCurrentUser(stored.email);
      setCurrentUserName(stored.name);
      setUserRole(stored.role);
    }

    setReportModalType(type);
    setReportModalOpen(true);
  };

  const handleCreateItem = async (newItem: Partial<Item>) => {
    await apiClient.createItem(newItem);
    await refreshAllData();
    await fetchUserNotifications();
  };

  const handleDeleteItem = async (id: number) => {
    await apiClient.deleteItem(id);
    await refreshAllData();
    if (inspectItem && inspectItem.id === id) {
      setInspectItem(null);
    }
  };

  const handleInitiateClaim = (target: Item, relatedLostItem?: Item) => {
    const stored = getStoredAuth();
    const activeEmail = currentUser || stored?.email;
    if (!isLoggedIn && !activeEmail) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    if (!isLoggedIn && stored) {
      setIsLoggedIn(true);
      setCurrentUser(stored.email);
      setCurrentUserName(stored.name);
      setUserRole(stored.role);
    }
    setClaimTargetItem(target);
    setClaimModalOpen(true);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: { email: string; name: string; role: 'STUDENT' | 'ADMIN' }) => {
    setCurrentUser(user.email);
    setCurrentUserName(user.name);
    setUserRole(user.role);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('lostfound_auth', JSON.stringify(user));
    } catch (err) {
      console.warn('Failed to store auth to localStorage:', err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setCurrentUserName('');
    setUserRole('STUDENT');
    setNotifications([]);
    try {
      localStorage.removeItem('lostfound_auth');
    } catch (err) {
      console.warn('Failed to clear auth from localStorage:', err);
    }
    if (activeTab === 'activity' || activeTab === 'admin') {
      setActiveTab('directory');
    }
  };

  // Notification Handlers
  const handleMarkNotificationRead = async (id: number) => {
    await apiClient.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!currentUser) return;
    await apiClient.markAllNotificationsRead(currentUser);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = async () => {
    if (!currentUser) return;
    await apiClient.clearNotifications(currentUser);
    setNotifications([]);
  };

  const handleConfirmReceivedFromNotif = async (claimId: number) => {
    if (!currentUser) return;
    try {
      await apiClient.confirmReceived(claimId, currentUser);
      await refreshAllData();
      await fetchUserNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm item received');
    }
  };

  const handleVerifyAndShare = async (
    claimId: number,
    isCorrect: boolean,
    sharePhone: boolean,
    shareEmail: boolean,
    notes?: string
  ) => {
    if (!currentUser) return;
    await apiClient.verifyAndShareClaim(claimId, currentUser, isCorrect, sharePhone, shareEmail, notes);
    await refreshAllData();
    await fetchUserNotifications();
  };

  const handleClaimantShareContact = async (
    claimId: number,
    shareContact: boolean,
    sharePhone: boolean,
    shareEmail: boolean
  ) => {
    if (!currentUser) return;
    await apiClient.claimantShareContact(claimId, currentUser, shareContact, sharePhone, shareEmail);
    await refreshAllData();
    await fetchUserNotifications();
  };

  const myLostReports = items.filter(
    i => i.type === 'LOST' && i.reporterEmail && currentUser && i.reporterEmail.toLowerCase() === currentUser.toLowerCase()
  );

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={handleOpenReportModal}
        currentUser={currentUser}
        currentUserName={currentUserName}
        userRole={userRole}
        isLoggedIn={isLoggedIn}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        pendingClaimsCount={pendingClaimsCount}
        matchesCount={matches.length}
        unreadNotificationsCount={unreadNotifCount}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
      />

      {/* Main Tab Content */}
      <main style={{ flex: 1 }}>
        {activeTab === 'directory' && (
          <>
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearchSubmit={(q) => setSearchQuery(q)}
              onSelectSuggestion={(s) => setSearchQuery(s)}
              onOpenReportModal={handleOpenReportModal}
              totalItemsCount={items.length}
            />

            <ItemExplorer
              items={items}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onSelectItem={(item) => setInspectItem(item)}
              onCheckMatches={() => {
                setActiveTab('matches');
              }}
              onClaimItem={(item) => handleInitiateClaim(item)}
            />
          </>
        )}

        {activeTab === 'matches' && (
          <div style={{ paddingTop: 28 }}>
            <SmartMatchmaker
              matches={matches}
              currentUser={currentUser}
              onInitiateClaim={(found, lost) => handleInitiateClaim(found, lost)}
              onInspectItem={(item) => setInspectItem(item)}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div style={{ paddingTop: 28 }}>
            <StudentActivity
              currentUserEmail={currentUser}
              items={items}
              onRefreshData={refreshAllData}
              onEditItem={(item) => {
                setInspectItem(item);
              }}
              onOpenNotifications={() => setNotificationDrawerOpen(true)}
            />
          </div>
        )}

        {activeTab === 'admin' && userRole === 'ADMIN' && (
          <div style={{ paddingTop: 28 }}>
            <AdminDashboard
              adminEmail={currentUser}
              onRefreshData={refreshAllData}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <ReportModal
        isOpen={reportModalOpen}
        initialType={reportModalType}
        currentUser={currentUser}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleCreateItem}
      />

      <ItemDetailModal
        item={inspectItem}
        onClose={() => setInspectItem(null)}
        onClaimItem={(item) => handleInitiateClaim(item)}
        onFindMatches={() => setActiveTab('matches')}
        currentUserEmail={currentUser}
        userRole={userRole}
        onDeleteItem={handleDeleteItem}
      />

      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => {
          setClaimModalOpen(false);
          setClaimTargetItem(null);
        }}
        targetItem={claimTargetItem}
        currentUserEmail={currentUser}
        userLostReports={myLostReports}
        onClaimSubmitted={() => {
          refreshAllData();
          fetchUserNotifications();
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Notification Records Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearNotifications}
        onConfirmReceived={handleConfirmReceivedFromNotif}
        onOpenPopup={(notif) => {
          setActivePopupNotification(notif);
          setNotificationDrawerOpen(false);
        }}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setNotificationDrawerOpen(false);
        }}
        currentUser={currentUser}
      />

      {/* Live Notification Popup with Sound */}
      <NotificationPopup
        notification={activePopupNotification}
        currentUserEmail={currentUser}
        onClose={() => setActivePopupNotification(null)}
        onVerifyAndShare={handleVerifyAndShare}
        onClaimantShareContact={handleClaimantShareContact}
        onConfirmReceived={handleConfirmReceivedFromNotif}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setActivePopupNotification(null);
        }}
      />

      {/* Production Clean Light Theme Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '28px 20px',
        backgroundColor: '#ffffff',
        fontSize: '0.84rem',
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="Lost & Found" style={{ height: 32, width: 'auto', display: 'block' }} />
            <span>— Official Campus Community Recovery Platform</span>
          </div>
          <div>
            Campus Security &amp; Student Operations Desk • Privacy &amp; Trust Assured
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

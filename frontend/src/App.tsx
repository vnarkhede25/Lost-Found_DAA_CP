import React, { useState, useEffect } from 'react';
import type { Item, Match } from './types';
import { apiClient } from './api/client';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ItemExplorer } from './components/ItemExplorer';
import { SmartMatchmaker } from './components/SmartMatchmaker';
import { StudentActivity } from './components/StudentActivity';
import { AdminDashboard } from './components/AdminDashboard';
import { DAAInspector } from './components/DAAInspector';
import { ReportModal } from './components/ReportModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ClaimModal } from './components/ClaimModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'directory' | 'matches' | 'activity' | 'admin' | 'daa'>('directory');
  const [items, setItems] = useState<Item[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('alex.morgan@university.edu');
  const [userRole, setUserRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');

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

  // Pending Claims Count
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);

  const refreshAllData = async () => {
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
  };

  useEffect(() => {
    refreshAllData();
  }, [searchQuery, selectedCategory, selectedType, selectedStatus, sortBy]);

  // Actions
  const handleOpenReportModal = (type: 'LOST' | 'FOUND') => {
    setReportModalType(type);
    setReportModalOpen(true);
  };

  const handleCreateItem = async (newItem: Partial<Item>) => {
    await apiClient.createItem(newItem);
    await refreshAllData();
  };

  const handleDeleteItem = async (id: number) => {
    await apiClient.deleteItem(id);
    await refreshAllData();
    if (inspectItem && inspectItem.id === id) {
      setInspectItem(null);
    }
  };

  const handleInitiateClaim = (target: Item, relatedLostItem?: Item) => {
    setClaimTargetItem(target);
    setClaimModalOpen(true);
  };

  const myLostReports = items.filter(
    i => i.type === 'LOST' && i.reporterEmail && i.reporterEmail.toLowerCase() === currentUser.toLowerCase()
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={handleOpenReportModal}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        userRole={userRole}
        setUserRole={setUserRole}
        pendingClaimsCount={pendingClaimsCount}
        matchesCount={matches.length}
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
              onCheckMatches={(item) => {
                setActiveTab('matches');
              }}
              onClaimItem={(item) => handleInitiateClaim(item)}
            />
          </>
        )}

        {activeTab === 'matches' && (
          <div style={{ paddingTop: 24 }}>
            <SmartMatchmaker
              matches={matches}
              currentUser={currentUser}
              onInitiateClaim={(found, lost) => handleInitiateClaim(found, lost)}
              onInspectItem={(item) => setInspectItem(item)}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <StudentActivity
            currentUserEmail={currentUser}
            items={items}
            onRefreshData={refreshAllData}
            onEditItem={(item) => {
              setInspectItem(item);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            adminEmail={currentUser}
            onRefreshData={refreshAllData}
          />
        )}

        {activeTab === 'daa' && (
          <DAAInspector />
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
        }}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 20px',
        backgroundColor: 'var(--bg-secondary)',
        fontSize: '0.82rem',
        color: 'var(--text-muted)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>CampusFind</strong> — Official College Lost &amp; Found Platform • Course Project in Design &amp; Analysis of Algorithms (DAA)
          </div>
          <div>
            Units I (Complexity Analysis) • Unit II (Merge Sort) • Unit III (LCS Dynamic Programming) • Unit V (Bipartite Matching)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { Plant, NavigationTab, JournalEntry, CareTask, JournalObservationType } from './types/garden';
import { GardenProvider, useGarden } from './context/GardenContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { BannerDemoNotice } from './components/common/BannerDemoNotice';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmDeleteDialog } from './components/common/ConfirmDeleteDialog';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { MyGardenPage } from './components/garden/MyGardenPage';
import { PlantDoctorPage } from './components/doctor/PlantDoctorPage';
import { CarePlannerPage } from './components/care/CarePlannerPage';
import { GrowthJournalPage } from './components/journal/GrowthJournalPage';
import { AddPlantModal } from './components/garden/AddPlantModal';
import { EditPlantModal } from './components/garden/EditPlantModal';
import { PlantDetailModal } from './components/garden/PlantDetailModal';
import { AddCareTaskModal } from './components/care/AddCareTaskModal';
import { AddJournalModal } from './components/journal/AddJournalModal';
import { EditJournalModal } from './components/journal/EditJournalModal';
import { JournalDetailModal } from './components/journal/JournalDetailModal';
import { ConfirmDeleteJournalDialog } from './components/journal/ConfirmDeleteJournalDialog';
import { SettingsModal } from './components/settings/SettingsModal';

const GardenMindAppInner: React.FC = () => {
  const {
    plants,
    careTasks,
    journalEntries,
    addPlant,
    updatePlant,
    removePlant,
    toggleCareTask,
    addCareTask,
    addJournalEntry,
    updateJournalEntry,
    removeJournalEntry,
    resetToDemoData,
  } = useGarden();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal Dialog States
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [isAddCareTaskOpen, setIsAddCareTaskOpen] = useState(false);
  const [isAddJournalOpen, setIsAddJournalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Journal Pre-fill Defaults
  const [addJournalDefaults, setAddJournalDefaults] = useState<{
    plantId?: string;
    type?: JournalObservationType;
    title?: string;
    notes?: string;
  }>({});

  // Active Plant for Detail / Edit / Delete Modals
  const [selectedPlantForDetails, setSelectedPlantForDetails] = useState<Plant | null>(null);
  const [selectedPlantForEdit, setSelectedPlantForEdit] = useState<Plant | null>(null);
  const [selectedPlantForDelete, setSelectedPlantForDelete] = useState<Plant | null>(null);

  // Active Journal Entry for Detail / Edit / Delete Modals
  const [selectedJournalForDetails, setSelectedJournalForDetails] = useState<JournalEntry | null>(null);
  const [selectedJournalForEdit, setSelectedJournalForEdit] = useState<JournalEntry | null>(null);
  const [selectedJournalForDelete, setSelectedJournalForDelete] = useState<JournalEntry | null>(null);

  // Keep selectedPlantForDetails synchronized if plant was edited
  const currentDetailsPlant = selectedPlantForDetails
    ? plants.find((p) => p.id === selectedPlantForDetails.id) || null
    : null;

  // Keep selectedJournalForDetails synchronized if entry was edited
  const currentDetailsJournal = selectedJournalForDetails
    ? journalEntries.find((e) => e.id === selectedJournalForDetails.id) || null
    : null;

  const attentionCount = plants.filter((p) => p.careStatus === 'attention').length;

  const handleConfirmDeletePlant = (plantId: string) => {
    removePlant(plantId);
    setSelectedPlantForDelete(null);
    if (selectedPlantForDetails?.id === plantId) {
      setSelectedPlantForDetails(null);
    }
  };

  const handleConfirmDeleteJournal = (entryId: string) => {
    removeJournalEntry(entryId);
    setSelectedJournalForDelete(null);
    if (selectedJournalForDetails?.id === entryId) {
      setSelectedJournalForDetails(null);
    }
  };

  const handleOpenAddJournal = (
    plantId?: string,
    type?: JournalObservationType,
    title?: string,
    notes?: string
  ) => {
    setAddJournalDefaults({ plantId, type, title, notes });
    setIsAddJournalOpen(true);
  };

  const handleOpenAddJournalForTask = (task: CareTask) => {
    const defaultType: JournalObservationType =
      task.taskType === 'repotting' ? 'repotting' : 'care';
    const defaultTitle = `Completed: ${task.title}`;
    const defaultNotes = task.notes
      ? `Completed care routine: ${task.title}\n\nTask notes: ${task.notes}`
      : `Completed care routine: ${task.title}`;

    handleOpenAddJournal(task.plantId, defaultType, defaultTitle, defaultNotes);
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col font-sans text-charcoal">
      {/* Top Prototype / Demonstration Notice */}
      <BannerDemoNotice />

      <div className="flex-1 flex w-full">
        {/* Desktop / Tablet Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSettings={() => setIsSettingsOpen(true)}
          plantCount={plants.length}
          attentionCount={attentionCount}
        />

        {/* Mobile Navigation Drawer & Bottom Bar */}
        <MobileNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          plantCount={plants.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            activeTab={activeTab}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenAddPlant={() => setIsAddPlantOpen(true)}
            onNavigateToDoctor={() => setActiveTab('plant-doctor')}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
            {activeTab === 'overview' ? (
              <OverviewDashboard
                plants={plants}
                careTasks={careTasks}
                journalEntries={journalEntries}
                onNavigate={setActiveTab}
                onOpenAddPlant={() => setIsAddPlantOpen(true)}
                onSelectPlant={(plant) => setSelectedPlantForDetails(plant)}
                onToggleTask={toggleCareTask}
                onOpenAddJournal={() => handleOpenAddJournal()}
              />
            ) : null}

            {activeTab === 'my-garden' ? (
              <MyGardenPage
                onOpenAddPlant={() => setIsAddPlantOpen(true)}
                onSelectPlant={(plant) => setSelectedPlantForDetails(plant)}
                onOpenEditPlant={(plant) => setSelectedPlantForEdit(plant)}
                onOpenDeletePlant={(plant) => setSelectedPlantForDelete(plant)}
              />
            ) : null}

            {activeTab === 'plant-doctor' ? (
              <PlantDoctorPage
                onNavigateToMyGarden={() => setActiveTab('my-garden')}
                onOpenAddPlant={() => setIsAddPlantOpen(true)}
              />
            ) : null}

            {activeTab === 'care-planner' ? (
              <CarePlannerPage
                careTasks={careTasks}
                plants={plants}
                onToggleTask={toggleCareTask}
                onOpenAddTask={() => setIsAddCareTaskOpen(true)}
                onOpenAddJournalForTask={handleOpenAddJournalForTask}
              />
            ) : null}

            {activeTab === 'growth-journal' ? (
              <GrowthJournalPage
                entries={journalEntries}
                plants={plants}
                onOpenAddJournal={() => handleOpenAddJournal()}
                onSelectEntry={(entry) => setSelectedJournalForDetails(entry)}
                onOpenEditEntry={(entry) => setSelectedJournalForEdit(entry)}
                onOpenDeleteEntry={(entry) => setSelectedJournalForDelete(entry)}
              />
            ) : null}
          </main>
        </div>
      </div>

      {/* Global Interactive Modals & Dialogs */}
      <AddPlantModal
        isOpen={isAddPlantOpen}
        onClose={() => setIsAddPlantOpen(false)}
        onAddPlant={addPlant}
      />

      <EditPlantModal
        plant={selectedPlantForEdit}
        isOpen={selectedPlantForEdit !== null}
        onClose={() => setSelectedPlantForEdit(null)}
        onUpdatePlant={updatePlant}
      />

      <PlantDetailModal
        plant={currentDetailsPlant}
        isOpen={currentDetailsPlant !== null}
        onClose={() => setSelectedPlantForDetails(null)}
        onOpenEdit={(plant) => setSelectedPlantForEdit(plant)}
        onOpenDelete={(plant) => setSelectedPlantForDelete(plant)}
        journalEntries={journalEntries}
        onAddJournalForPlant={(plant) => handleOpenAddJournal(plant.id)}
        onSelectJournalEntry={(entry) => setSelectedJournalForDetails(entry)}
      />

      <ConfirmDeleteDialog
        plant={selectedPlantForDelete}
        isOpen={selectedPlantForDelete !== null}
        onCancel={() => setSelectedPlantForDelete(null)}
        onConfirm={handleConfirmDeletePlant}
      />

      <AddCareTaskModal
        isOpen={isAddCareTaskOpen}
        onClose={() => setIsAddCareTaskOpen(false)}
        plants={plants}
        onAddTask={addCareTask}
      />

      <AddJournalModal
        isOpen={isAddJournalOpen}
        onClose={() => {
          setIsAddJournalOpen(false);
          setAddJournalDefaults({});
        }}
        plants={plants}
        onAddEntry={addJournalEntry}
        initialPlantId={addJournalDefaults.plantId}
        initialObservationType={addJournalDefaults.type}
        initialTitle={addJournalDefaults.title}
        initialNotes={addJournalDefaults.notes}
      />

      <EditJournalModal
        entry={selectedJournalForEdit}
        isOpen={selectedJournalForEdit !== null}
        onClose={() => setSelectedJournalForEdit(null)}
        plants={plants}
        onUpdateEntry={updateJournalEntry}
      />

      <JournalDetailModal
        entry={currentDetailsJournal}
        isOpen={currentDetailsJournal !== null}
        onClose={() => setSelectedJournalForDetails(null)}
        onOpenEdit={(entry) => setSelectedJournalForEdit(entry)}
        onOpenDelete={(entry) => setSelectedJournalForDelete(entry)}
        plant={plants.find((p) => p.id === currentDetailsJournal?.plantId) || null}
        onNavigateToPlant={(plant) => {
          setSelectedPlantForDetails(plant);
          setActiveTab('my-garden');
        }}
      />

      <ConfirmDeleteJournalDialog
        entry={selectedJournalForDelete}
        isOpen={selectedJournalForDelete !== null}
        onCancel={() => setSelectedJournalForDelete(null)}
        onConfirm={handleConfirmDeleteJournal}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetDemoData={resetToDemoData}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <GardenProvider>
      <GardenMindAppInner />
    </GardenProvider>
  );
};

export default App;

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { RefreshCw, User, Thermometer, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetDemoData,
}) => {
  const [userName, setUserName] = useState('Botanical Caretaker');
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = () => {
    onResetDemoData();
    setResetMessage('Demonstration plants, care tasks, and journal records have been restored.');
    setTimeout(() => setResetMessage(null), 3000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Preferences"
      subtitle="Application configuration and botanical parameters"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* User Profile */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-3 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-botanical" />
            <span>Gardener Profile</span>
          </h3>
          <div className="space-y-2">
            <label htmlFor="settings-user" className="block text-xs font-semibold text-forest-800">
              Display Name
            </label>
            <input
              id="settings-user"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50/50 text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Units */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-3 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-botanical" />
            <span>Botanical Units</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUnitSystem('metric')}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                unitSystem === 'metric'
                  ? 'bg-forest-800 text-ivory-50 border-forest-800 shadow-natural-sm'
                  : 'bg-white border-sage-200 text-charcoal'
              }`}
            >
              <div>Metric Units</div>
              <div className="text-[11px] font-normal opacity-80 mt-0.5">Celsius (°C) • Centimeters (cm)</div>
            </button>

            <button
              type="button"
              onClick={() => setUnitSystem('imperial')}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                unitSystem === 'imperial'
                  ? 'bg-forest-800 text-ivory-50 border-forest-800 shadow-natural-sm'
                  : 'bg-white border-sage-200 text-charcoal'
              }`}
            >
              <div>Imperial Units</div>
              <div className="text-[11px] font-normal opacity-80 mt-0.5">Fahrenheit (°F) • Inches (in)</div>
            </button>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="pt-4 border-t border-sage-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-2 flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-botanical" />
            <span>Demonstration State</span>
          </h3>
          <p className="text-xs text-charcoal-muted mb-3 leading-relaxed">
            Resetting restores the initial curated botanical specimens, care tasks, and journal records in the persistent database via the backend seed service.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sage-200 hover:bg-sage-300 text-forest-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Initial Botanical Demo State</span>
          </button>
          {resetMessage ? (
            <p className="text-[11px] text-alert-success mt-2 font-medium">
              {resetMessage}
            </p>
          ) : null}
        </div>

        {/* Backend Architecture Status */}
        <div className="p-3.5 bg-sage-50 rounded-xl border border-sage-200/80 text-xs text-charcoal-muted flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-botanical shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-forest-800">Production Architecture:</span>
            <p className="mt-0.5 leading-relaxed">
              FastAPI REST backend with SQLite relational persistence, local filesystem photo storage, and local ONNX MobileNetV2 plant pathology vision model.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-sage-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-forest-800 text-ivory-50 hover:bg-forest-700"
          >
            Save & Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export { GenerationControls } from './GenerationControls';
export { LoRASelector } from './LoRASelector';

// Export a combined component for easy integration
import React from 'react';
import { GenerationControls } from './GenerationControls';
import { LoRASelector } from './LoRASelector';

interface GenerationPanelProps {
  onSettingsChange: (settings: any) => void;
  disabled?: boolean;
}

export const GenerationPanel: React.FC<GenerationPanelProps> = ({ 
  onSettingsChange, 
  disabled 
}) => {
  const [generationParams, setGenerationParams] = React.useState({});
  const [selectedLoRAs, setSelectedLoRAs] = React.useState([]);

  const handleParamsChange = (params: any) => {
    setGenerationParams(params);
    onSettingsChange({
      ...params,
      lora_models: selectedLoRAs
    });
  };

  const handleLoRAChange = (loras: any[]) => {
    setSelectedLoRAs(loras);
    onSettingsChange({
      ...generationParams,
      lora_models: loras
    });
  };

  return (
    <div className="space-y-4">
      <GenerationControls 
        onParamsChange={handleParamsChange}
        disabled={disabled}
      />
      <div className="px-4 pb-4">
        <LoRASelector 
          onLoRAChange={handleLoRAChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
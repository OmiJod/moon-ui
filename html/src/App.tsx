import React from 'react';
import { PatternLock } from './components/locks/PatternLock';
import { PinLock } from './components/locks/PinLock';
import { KeypadLock } from './components/locks/KeypadLock';
import { ColorSequenceLock } from './components/locks/ColorSequenceLock';
import { GestureLock } from './components/locks/GestureLock';
import { SwipeLock } from './components/locks/SwipeLock';
import { KeycardSwipeLock } from './components/locks/KeycardSwipeLock';
import { MathPuzzleLock } from './components/locks/MathPuzzleLock';
import { AnagramLock } from './components/locks/AnagramLock';
import { MazeNavigationLock } from './components/locks/MazeNavigationLock';
import { WireCuttingLock } from './components/locks/WireCuttingLock';
import { SafeCrackingLock } from './components/locks/SafeCrackingLock';
import { PrecisionRingLock } from './components/locks/PrecisionRingLock';
import { ImageLock } from './components/locks/ImageLock';
import { InputForm } from './components/InputForm/InputForm';
import { AlertDialog } from './components/ui/AlertDialog';
import { ContextMenu } from './components/ui/ContextMenu';
import { HackersTerminalLock } from './components/locks/HackersTerminalLock';
import { ProgressBar } from './components/ui/ProgressBar';
import { SliderLock } from './components/locks/SliderLock';

type LockType = 'pattern' | 'pin' | 'keypad' | 'color' | 'gesture' | 'swipe' | 'keycard' | 
                'math' | 'anagram' | 'maze' | 'wire' | 'safe' | 'precision' | 'image' | 
                'input' | 'alert' | 'contextMenu' | 'hackersTerminal' | 'progress' | 'slider';

interface AppProps {
  lockType?: LockType;
  initialData?: any;
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

function App({ lockType = 'pattern', initialData, onComplete, visible, onClose }: AppProps) {
  if (!visible) return null;

  return (
    <>
      {lockType === 'hackersTerminal' && (
        <HackersTerminalLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
          initialData={initialData}
          handleFailure={initialData.handleFailure}
        />
      )}
      {lockType === 'contextMenu' && (
        <ContextMenu
          title={initialData.title}
          description={initialData.description}
          items={initialData.items}
          visible={visible}
          onClose={onClose}
          position={initialData.position}
        />
      )}
      {lockType === 'slider' && (
        <SliderLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
          initialData={initialData}
        />
      )}
      {lockType === 'progress' && (
        <ProgressBar
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
          initialData={initialData}
        />
      )}
      {lockType === 'alert' && (
        <AlertDialog
          title={initialData.title}
          description={initialData.description}
          cancelText={initialData.cancelText}
          submitText={initialData.submitText}
          onCancel={onClose}
          onSubmit={() => onComplete(true)}
          visible={visible}
        />
      )}
      {lockType === 'input' && (
        <InputForm
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
          title={initialData.title}
          fields={initialData?.fields || []}
        />
      )}
      {lockType === 'image' && (
        <ImageLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
          initialData={initialData}
        />
      )}
      {lockType === 'precision' && (
        <PrecisionRingLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
          initialData={initialData}
        />
      )}
      {lockType === 'pattern' && (
        <PatternLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'pin' && (
        <PinLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'keypad' && (
        <KeypadLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'color' && (
        <ColorSequenceLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'gesture' && (
        <GestureLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'swipe' && (
        <SwipeLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'keycard' && (
        <KeycardSwipeLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'math' && (
        <MathPuzzleLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'anagram' && (
        <AnagramLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
          initialData={initialData}
        />
      )}
      {lockType === 'maze' && (
        <MazeNavigationLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'wire' && (
        <WireCuttingLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
      {lockType === 'safe' && (
        <SafeCrackingLock
          onComplete={onComplete}
          visible={visible}
          onClose={onClose}
        />
      )}
    </>
  );
}

export default App;

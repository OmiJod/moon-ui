import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);

window.addEventListener('message', (event) => {
    const data = event.data;
    
    if (data.type === 'openImageLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="image"
                    initialData={{
                        imageUrl: data.imageUrl,
                        hasPassword: data.hasPassword
                    }}
                    onComplete={(success) => {
                        fetch('https://moon-ui/imageComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success })
                        });
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openPatternLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="pattern"
                    onComplete={(success) => {
                        fetch('https://moon-ui/patternComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pattern: success ? [1, 2, 3, 4, 5] : [] })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openPinLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="pin"
                    onComplete={(success) => {
                        fetch('https://moon-ui/pinComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ pin: success ? "123456" : "" })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openKeypadLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="keypad"
                    onComplete={(success) => {
                        fetch('https://moon-ui/keypadComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code: success ? "A1B2C3" : "" })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openColorSequenceLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="color"
                    onComplete={(success) => {
                        fetch('https://moon-ui/colorSequenceComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sequence: success ? ["red", "blue", "green", "yellow"] : [] })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openGestureLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="gesture"
                    onComplete={(success) => {
                        fetch('https://moon-ui/gestureComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ gesture: success ? [
                                { x: 100, y: 100 },
                                { x: 200, y: 200 },
                                { x: 300, y: 100 }
                            ] : [] })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openSwipeLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="swipe"
                    onComplete={(success) => {
                        fetch('https://moon-ui/swipeComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openKeycardLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="keycard"
                    onComplete={(success) => {
                        fetch('https://moon-ui/keycardComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openMathPuzzleLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="math"
                    onComplete={(success) => {
                        fetch('https://moon-ui/validateMathAnswer', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ answer: success ? 42 : 0 })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openAnagramLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="anagram"
                    initialData={{
                        scrambledWord: data.scrambledWord,
                        difficulty: data.difficulty
                    }}
                    onComplete={(success) => {
                        fetch('https://moon-ui/anagramComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ answer: success ? data.scrambledWord : "" })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openMazeNavigationLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="maze"
                    onComplete={(success) => {
                        fetch('https://moon-ui/mazeComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openWireCuttingLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="wire"
                    initialData={{
                        wires: data.wires || [],
                        clue: data.clue || ''
                    }}
                    onComplete={(success) => {
                        fetch('https://moon-ui/wireCuttingComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openSafeLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="safe"
                    onComplete={(success) => {
                        fetch('https://moon-ui/safeCrackingComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openPrecisionRingLock') {
        root.render(
            <StrictMode>
                <App
                    lockType="precision"
                    initialData={{
                        speed: data.speed,
                        targetSize: data.targetSize,
                        requiredHits: data.requiredHits
                    }}
                    onComplete={(success) => {
                        fetch('https://moon-ui/precisionRingComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openInputForm') {
        root.render(
            <StrictMode>
                <App
                    lockType="input"
                    initialData={{
                        fields: data.fields,
                        title: data.title
                    }}
                    onComplete={(success) => {
                        fetch('https://moon-ui/inputComplete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success })
                        });
                        if (success) {
                            root.render(null);
                        }
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/closeUI', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openAlertDialog') {
        root.render(
            <StrictMode>
                <App
                    lockType="alert"
                    initialData={{
                        title: data.title,
                        description: data.description,
                        cancelText: data.cancelText,
                        submitText: data.submitText
                    }}
                    onComplete={() => {
                        fetch('https://moon-ui/dialogSubmit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ success: true })
                        });
                        root.render(null);
                    }}
                    visible={true}
                    onClose={() => {
                        fetch('https://moon-ui/dialogCancel', {
                            method: 'POST'
                        });
                        root.render(null);
                    }}
                />
            </StrictMode>
        );
    } else if (data.type === 'openContextMenu') {
            root.render(
                <StrictMode>
                    <App
                        lockType="contextMenu"
                        initialData={{
                            title: data.title,
                            description: data.description,
                            items: data.items,
                            position: data.position
                        }}
                        onComplete={() => {}}
                        visible={true}
                        onClose={() => {
                            fetch('https://moon-ui/closeUI', {
                                method: 'POST'
                            });
                            root.render(null);
                        }}
                    />
                </StrictMode>
            );
    } else if (data.type === 'openHackersTerminal') {
            root.render(
                <StrictMode>
                    <App
                        lockType="hackersTerminal"
                        initialData={{
                            language: data.language,
                            challenge: data.challenge,
                            timeLimit: data.timeLimit,
                            testCases: data.testCases,
                            handleFailure: (message: string) => {
                                fetch('https://moon-ui/validateCode', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        success: false,
                                        reason: message,
                                        code: null,
                                        language: data.language,
                                        testCases: data.testCases
                                    })
                                }).finally(() => {
                                    fetch('https://moon-ui/closeUI', { method: 'POST' });
                                    root.render(null); // Actually closes the UI
                                });
                            }
                            
                            
                            
                        }}
                        onComplete={(success) => {
                            fetch('https://moon-ui/validateCode', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ success })
                            });
                        
                            if (success) {
                                root.render(null); // Only close on success
                            }
                        }}
                        
                        visible={true}
                        onClose={() => {
                            fetch('https://moon-ui/closeUI', {
                                method: 'POST'
                            });
                            root.render(null);
                        }}
                    />
                </StrictMode>
            );
        } else if (data.type === 'patternResult' || data.type === 'pinResult' || 
            data.type === 'keypadResult' || data.type === 'colorSequenceResult' || 
            data.type === 'gestureResult' || data.type === 'swipeResult' ||
            data.type === 'keycardResult' || data.type === 'mathPuzzleResult' ||
            data.type === 'anagramResult' || data.type === 'mazeResult' ||
            data.type === 'wireCuttingResult' || data.type === 'safeResult' ||
            data.type === 'precisionRingResult' || data.type === 'imageResult' ||
            data.type === 'hackersTerminalResult') {
        if (data.success) {
            root.render(null);
        }
    }
});
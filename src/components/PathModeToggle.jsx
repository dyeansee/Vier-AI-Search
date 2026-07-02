import { useCallback } from 'react';

export default function PathModeToggle({ pathMode, setPathMode }) {
  const isMemory = pathMode === 'memory';

  const handleToggle = useCallback(() => {
    setPathMode(isMemory ? 'new' : 'memory');
  }, [isMemory, setPathMode]);

  return (
    <div className="liquid-path-toggle" onClick={handleToggle}>
      <div className={`liquid-path-label ${isMemory ? 'active' : ''}`}>
        <span className={`liquid-path-dot ${isMemory ? 'active-dot' : ''}`} />
        保留记忆追问
      </div>
      <div className={`liquid-path-label ${!isMemory ? 'active' : ''}`}>
        <span className={`liquid-path-dot ${!isMemory ? 'active-dot' : ''}`} />
        新对话
      </div>
      <div className={`liquid-path-slider ${isMemory ? 'pos-left' : 'pos-right'}`} />
    </div>
  );
}

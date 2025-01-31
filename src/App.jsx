import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  File,
  Music4,
  Rocket,
  X,
  Trash2,
  Globe,
} from 'lucide-react';
import { Button } from './components/ui/button.jsx';
import { Card } from './components/ui/card.jsx';

/* ======= Тип данных =======
   desktopIcons = [
     {
       id: 'mycomputer',
       title: 'My Computer',
       icon: Monitor,
       x: 20,
       y: 20
     },
     {
       id: 'notepad',
       title: 'Notepad',
       icon: File,
       x: 100,
       y: 20
     },
     ...
   ];
*/

function DesktopIcon({ icon: Icon, label, onOpen, x, y, onDragEnd }) {
  return (
    <motion.div
      className="absolute w-16 h-16 cursor-default select-none"
      style={{ top: y, left: x }}
      drag
      dragElastic={0}
      onDragEnd={(event, info) => {
        onDragEnd(info.point.x, info.point.y);
      }}
    >
      <div onDoubleClick={onOpen} className="flex flex-col items-center">
        <div className="flex items-center justify-center h-12 w-12 border bg-gray-200 hover:bg-gray-300 shadow-inner rounded">
          <Icon size={24} />
        </div>
        <span className="text-xs text-center mt-1">{label}</span>
      </div>
    </motion.div>
  );
}

// ---------- Notepad ----------
function Notepad({ existingFile, onSaveFile }) {
  const [filename, setFilename] = useState(existingFile ? existingFile.name : '');
  const [text, setText] = useState(existingFile ? existingFile.content : '');

  const handleSave = () => {
    if (!filename.trim()) return;
    onSaveFile(filename.trim(), text);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center space-x-2 p-1 bg-gray-200 border-b border-gray-300">
        <label className="text-xs">File name:</label>
        <input
          className="border text-xs px-1 py-0.5"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />
        <Button onClick={handleSave}>Save</Button>
      </div>
      <textarea
        className="flex-1 w-full h-full border p-2 text-sm font-mono"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}

// ---------- Recycle Bin ----------
function RecycleBin({ items, onEmpty, onRestore }) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center bg-gray-200 border-b border-gray-300 p-1">
        <Button onClick={onEmpty} className="mr-2">Empty</Button>
        <span className="text-xs">Files in Recycle Bin: {items.length}</span>
      </div>
      <div className="p-2 overflow-auto text-xs flex-1">
        {items.length === 0 && <p className="text-gray-500">Recycle Bin is empty.</p>}
        {items.map((file) => (
          <div key={file.id} className="flex items-center justify-between hover:bg-gray-100 px-2 py-1">
            <span>{file.name}</span>
            <Button onClick={() => onRestore(file)}>Restore</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- MyComputer (проводник) ----------
function MyComputer({ documents, recycleBin, onOpenFile, onDeleteFile, onEmptyBin, onRestoreFile }) {
  const [currentFolder, setCurrentFolder] = useState('root');
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, file: null });

  // Закрываем контекстное меню при клике вне
  useEffect(() => {
    function handleGlobalClick() {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, file: null });
      }
    }
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [contextMenu.visible]);

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    if (file) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        file
      });
    }
  };

  const handleDelete = () => {
    if (contextMenu.file) {
      onDeleteFile(contextMenu.file);
    }
    setContextMenu({ visible: false, x: 0, y: 0, file: null });
  };

  // Папки
  const itemsRoot = [
    { id: 'cdrive', name: 'C:\\', type: 'folder' },
    { id: 'ddrive', name: 'D:\\', type: 'folder' },
    { id: 'documents', name: 'Documents', type: 'folder' },
    { id: 'recyclebin', name: 'Recycle Bin', type: 'folder' },
  ];

  if (currentFolder === 'root') {
    return (
      <div className="relative w-full h-full text-sm flex flex-col">
        <div className="p-2 border-b border-gray-300 bg-gray-200 flex-none">
          <p>Drives and Folders:</p>
        </div>
        <div className="p-2 flex-auto overflow-auto">
          {itemsRoot.map((item) => (
            <div
              key={item.id}
              className="cursor-pointer hover:bg-gray-100 p-1"
              onDoubleClick={() => {
                if (item.id === 'documents') setCurrentFolder('documents');
                else if (item.id === 'recyclebin') setCurrentFolder('recyclebin');
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
        {contextMenu.visible && (
          <div
            className="absolute bg-white border border-gray-500 text-sm z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-2 py-1 hover:bg-blue-500 hover:text-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </div>
          </div>
        )}
      </div>
    );
  } else if (currentFolder === 'documents') {
    const docFiles = documents.filter((f) => f.folder === 'Documents');
    return (
      <div className="relative w-full h-full text-sm flex flex-col">
        {/* Навигация */}
        <div className="p-2 border-b border-gray-300 bg-gray-200 flex-none flex items-center">
          <button
            className="mr-2 text-xs px-2 py-1 border border-gray-400 hover:bg-gray-300"
            onClick={() => setCurrentFolder('root')}
          >
            ..
          </button>
          <span>Documents</span>
        </div>
        <div className="p-2 flex-auto overflow-auto">
          {docFiles.length === 0 && <p className="text-gray-500">No files in Documents.</p>}
          {docFiles.map((file) => (
            <div
              key={file.id}
              onDoubleClick={() => onOpenFile(file)}
              onContextMenu={(e) => handleContextMenu(e, file)}
              className="cursor-pointer hover:bg-gray-100 p-1 flex justify-between"
            >
              <span>{file.name}</span>
            </div>
          ))}
        </div>
        {contextMenu.visible && (
          <div
            className="absolute bg-white border border-gray-500 text-sm z-50"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-2 py-1 hover:bg-blue-500 hover:text-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </div>
          </div>
        )}
      </div>
    );
  } else if (currentFolder === 'recyclebin') {
    // Показываем содержимое Корзины
    return (
      <RecycleBin
        items={recycleBin}
        onEmpty={onEmptyBin}
        onRestore={onRestoreFile}
      />
    );
  } else {
    return (
      <div className="p-2">
        <p>Unknown folder.</p>
        <button onClick={() => setCurrentFolder('root')}>Back</button>
      </div>
    );
  }
}

// ---------- Minesweeper ----------
function generateBoard() {
  const rows = 8;
  const cols = 8;
  const bombsCount = 10;
  const board = [];

  // Инициализируем пустой борд
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        revealed: false,
        bomb: false,
        flagged: false,
        adjacent: 0,
      });
    }
    board.push(row);
  }

  // Расставляем бомбы
  let placed = 0;
  while (placed < bombsCount) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].bomb) {
      board[r][c].bomb = true;
      placed++;
    }
  }

  // Подсчитываем adjacent
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].bomb) {
        continue;
      }
      let count = 0;
      for (let rr = -1; rr <= 1; rr++) {
        for (let cc = -1; cc <= 1; cc++) {
          const nr = r + rr;
          const nc = c + cc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].bomb) {
            count++;
          }
        }
      }
      board[r][c].adjacent = count;
    }
  }
  return board;
}

function revealCell(board, r, c) {
  if (board[r][c].revealed || board[r][c].flagged) return;
  board[r][c].revealed = true;
  // Если 0 - открываем все рядом
  if (board[r][c].adjacent === 0 && !board[r][c].bomb) {
    for (let rr = -1; rr <= 1; rr++) {
      for (let cc = -1; cc <= 1; cc++) {
        const nr = r + rr;
        const nc = c + cc;
        if (
          nr >= 0 && nr < board.length &&
          nc >= 0 && nc < board[0].length
        ) {
          revealCell(board, nr, nc);
        }
      }
    }
  }
}

function Minesweeper() {
  const [board, setBoard] = useState(generateBoard);
  const [gameOver, setGameOver] = useState(false);

  const handleCellClick = (r, c) => {
    if (gameOver) return;
    const newBoard = structuredClone(board);
    if (newBoard[r][c].bomb) {
      // GAME OVER
      newBoard[r][c].revealed = true;
      setBoard(newBoard);
      setGameOver(true);
      return;
    }
    revealCell(newBoard, r, c);
    setBoard(newBoard);
  };

  const handleRightClick = (e, r, c) => {
    e.preventDefault();
    if (gameOver) return;
    const newBoard = structuredClone(board);
    if (!newBoard[r][c].revealed) {
      newBoard[r][c].flagged = !newBoard[r][c].flagged;
    }
    setBoard(newBoard);
  };

  const handleNewGame = () => {
    setBoard(generateBoard());
    setGameOver(false);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex items-center justify-between bg-gray-200 p-1 border-b border-gray-300">
        <span className="text-xs">{gameOver ? 'Game Over' : 'Minesweeper'}</span>
        <Button onClick={handleNewGame}>New Game</Button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        <div className="inline-block border border-gray-600">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                let content = '';
                let style = 'w-6 h-6 border border-gray-400 flex items-center justify-center text-xs ';
                if (cell.revealed) {
                  if (cell.bomb) {
                    content = '💣';
                    style += 'bg-red-400';
                  } else if (cell.adjacent > 0) {
                    content = cell.adjacent;
                    style += 'bg-gray-200';
                  } else {
                    style += 'bg-gray-200';
                  }
                } else {
                  if (cell.flagged) {
                    content = '🚩';
                  }
                  style += 'bg-gray-300 cursor-pointer';
                }

                return (
                  <div
                    key={c}
                    className={style}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleRightClick(e, r, c)}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Internet Explorer ----------
function InternetExplorer() {
  const [url, setUrl] = useState('https://web.archive.org/web/20011020140856/http://www.google.com/');
  const [currentUrl, setCurrentUrl] = useState(url);

  const handleGo = () => {
    if (!url.startsWith('http')) {
      setCurrentUrl('https://' + url);
    } else {
      setCurrentUrl(url);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-1 bg-gray-200 border-b border-gray-300 flex items-center space-x-1">
        <input
          className="border text-xs px-1 py-0.5 flex-1"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGo()}
        />
        <Button onClick={handleGo}>Go</Button>
      </div>
      <iframe
        title="Internet Explorer"
        src={currentUrl}
        className="flex-1"
      />
    </div>
  );
}

// ---------- Окно Win95Window ----------
function Win95Window({
  app,
  onClose,
  onFocus,
  isFocused,
  zIndex,
  onToggleMinimize,
  documents,
  setDocuments,
  recycleBin,
  setRecycleBin,
  onOpenApp,
}) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [pos, setPos] = useState({ x: 100, y: 100 });

  if (app.isMinimized) return null;

  const handleDrag = (e, info) => {
    setPos({ x: pos.x + info.delta.x, y: pos.y + info.delta.y });
  };

  const handleDoubleClickTitle = () => {
    setIsMaximized(!isMaximized);
  };

  // Колбэки для MyComputer
  const handleOpenFileFromDocuments = (file) => {
    onOpenApp({ title: 'Notepad', id: 'notepad', icon: File }, file);
  };
  const handleDeleteFile = (file) => {
    // Удаляем из documents
    setDocuments((prev) => prev.filter((f) => f.id !== file.id));
    // Добавляем в корзину
    setRecycleBin((prev) => [...prev, file]);
  };
  const handleEmptyBin = () => {
    setRecycleBin([]);
  };
  const handleRestoreFile = (file) => {
    setRecycleBin((prev) => prev.filter((f) => f.id !== file.id));
    setDocuments((prev) => [...prev, file]);
  };

  const handleSaveFile = (filename, text) => {
    setDocuments((prev) => {
      const existingIndex = prev.findIndex((f) => f.name === filename && f.folder === 'Documents');
      if (existingIndex !== -1) {
        // перезаписываем
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          content: text,
        };
        return updated;
      } else {
        // создаём новый
        const newFile = {
          id: Date.now().toString(),
          name: filename,
          content: text,
          folder: 'Documents',
          type: 'file',
        };
        return [...prev, newFile];
      }
    });
  };

  return (
    <motion.div
      onMouseDown={onFocus}
      className={`absolute border border-gray-800 bg-gray-200 shadow-lg ${
        isFocused ? '' : 'opacity-90'
      }`}
      style={{
        zIndex,
        width: isMaximized ? '100vw' : '400px',
        height: isMaximized ? '90vh' : '300px',
        top: isMaximized ? 0 : pos.y,
        left: isMaximized ? 0 : pos.x,
      }}
      drag={!isMaximized}
      onDrag={handleDrag}
      dragConstraints={{ left: 0, top: 0, right: 2000, bottom: 1200 }}
      dragElastic={0}
    >
      <div
        onDoubleClick={handleDoubleClickTitle}
        className="flex items-center justify-between bg-gray-500 text-white px-2 py-1 cursor-move"
      >
        <span className="font-bold">{app.title}</span>
        <div className="flex space-x-2">
          <button
            className="w-6 h-6 bg-gray-300 text-black flex items-center justify-center border"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize(app.id);
            }}
          >
            _
          </button>
          <button
            className="w-6 h-6 bg-gray-300 text-black flex items-center justify-center border"
            onClick={(e) => {
              e.stopPropagation();
              setIsMaximized(!isMaximized);
            }}
          >
            [ ]
          </button>
          <button
            className="w-6 h-6 bg-red-600 text-white flex items-center justify-center border"
            onClick={(e) => {
              e.stopPropagation();
              onClose(app.id);
            }}
          >
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="p-0 overflow-auto h-full bg-gray-100 flex flex-col">
        {/* контент приложения */}
        {app.id === 'mycomputer' ? (
          <MyComputer
            documents={documents}
            recycleBin={recycleBin}
            onOpenFile={handleOpenFileFromDocuments}
            onDeleteFile={handleDeleteFile}
            onEmptyBin={handleEmptyBin}
            onRestoreFile={handleRestoreFile}
          />
        ) : app.id === 'minesweeper' ? (
          <Minesweeper />
        ) : app.id === 'notepad' ? (
          <Notepad existingFile={app.file} onSaveFile={handleSaveFile} />
        ) : app.id === 'recyclebin' ? (
          <RecycleBin
            items={recycleBin}
            onEmpty={handleEmptyBin}
            onRestore={handleRestoreFile}
          />
        ) : app.id === 'ie' ? (
          <InternetExplorer />
        ) : (
          <p className="text-sm p-2">Welcome to {app.title}!</p>
        )}
      </div>
    </motion.div>
  );
}

// ---------- Кнопка в таскбаре ----------
function TaskbarAppButton({ app, isFocused, onClick }) {
  return (
    <button
      className={`text-xs px-2 h-full border-r border-gray-600 flex items-center justify-center ${
        isFocused ? 'bg-gray-400' : 'bg-gray-200'
      } hover:bg-gray-300`}
      onClick={onClick}
    >
      {app.title}
    </button>
  );
}

// ---------- Меню Пуск (Start Menu) ----------
function StartMenu({ isOpen, onClose, onOpenApp }) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-8 left-0 bg-gray-200 border border-gray-600 w-48 z-50">
      <ul>
        <li
          className="p-2 hover:bg-gray-300 cursor-pointer"
          onClick={() => {
            onOpenApp({ title: 'My Computer', id: 'mycomputer', icon: Monitor });
            onClose();
          }}
        >
          My Computer
        </li>
        <li
          className="p-2 hover:bg-gray-300 cursor-pointer"
          onClick={() => {
            onOpenApp({ title: 'Notepad', id: 'notepad', icon: File });
            onClose();
          }}
        >
          Notepad
        </li>
        <li
          className="p-2 hover:bg-gray-300 cursor-pointer"
          onClick={() => {
            onOpenApp({ title: 'Minesweeper', id: 'minesweeper', icon: Rocket });
            onClose();
          }}
        >
          Minesweeper
        </li>
        <li
          className="p-2 hover:bg-gray-300 cursor-pointer"
          onClick={() => {
            onOpenApp({ title: 'Internet Explorer', id: 'ie', icon: Globe });
            onClose();
          }}
        >
          Internet Explorer
        </li>
      </ul>
    </div>
  );
}

// ---------- Часы ----------
function SystemClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');

  return (
    <div className="mr-2 text-xs px-2 bg-gray-200 border-l border-gray-500 h-full flex items-center justify-center">
      {hours}:{minutes}
    </div>
  );
}

// ---------- Главный компонент (окно Windows 95) ----------
export default function App() {
  const [openApps, setOpenApps] = useState([]);
  const [focusedApp, setFocusedApp] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // Файлы пользователя
  const [documents, setDocuments] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]);

  // Иконки на рабочем столе
  const [desktopIcons, setDesktopIcons] = useState([
    {
      id: 'mycomputer',
      title: 'My Computer',
      icon: Monitor,
      x: 20,
      y: 20,
    },
    {
      id: 'notepad',
      title: 'Notepad',
      icon: File,
      x: 100,
      y: 20,
    },
    {
      id: 'multimedia',
      title: 'Multimedia',
      icon: Music4,
      x: 180,
      y: 20,
    },
    {
      id: 'minesweeper',
      title: 'Minesweeper',
      icon: Rocket,
      x: 260,
      y: 20,
    },
    {
      id: 'ie',
      title: 'Internet',
      icon: Globe,
      x: 340,
      y: 20,
    },
    {
      id: 'recyclebin',
      title: 'Recycle Bin',
      icon: Trash2,
      x: 600,
      y: 400,
    },
  ]);

  const handleIconOpen = (icon, file = null) => {
    // уже открыто?
    const existing = openApps.find((a) => a.id === icon.id);
    if (!existing) {
      setOpenApps((prev) => [
        ...prev,
        { ...icon, isMinimized: false, file }
      ]);
      setFocusedApp(icon.id);
    } else {
      // Просто фокусируем
      setFocusedApp(icon.id);
      // если свернуто, разворачиваем
      if (existing.isMinimized) {
        setOpenApps((prev) =>
          prev.map((app) =>
            app.id === icon.id ? { ...app, isMinimized: false } : app
          )
        );
      }
    }
  };

  const handleOpenApp = (app, file = null) => {
    handleIconOpen(app, file);
  };

  const handleCloseApp = (id) => {
    setOpenApps((prev) => prev.filter((app) => app.id !== id));
    setFocusedApp(null);
  };

  const handleFocus = (id) => {
    setFocusedApp(id);
  };

  const handleToggleMinimize = (id) => {
    setOpenApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, isMinimized: !app.isMinimized } : app
      )
    );
  };

  const onDragEndIcon = (iconId, newX, newY) => {
    setDesktopIcons((prev) =>
      prev.map((icon) =>
        icon.id === iconId ? { ...icon, x: newX, y: newY } : icon
      )
    );
  };

  return (
    <div className="w-screen h-screen overflow-hidden text-sm relative bg-[#008080]">
      {/* Иконки на рабочем столе */}
      {desktopIcons.map((icon) => (
        <DesktopIcon
          key={icon.id}
          icon={icon.icon}
          label={icon.title}
          x={icon.x}
          y={icon.y}
          onOpen={() => handleIconOpen(icon)}
          onDragEnd={(newX, newY) => onDragEndIcon(icon.id, newX, newY)}
        />
      ))}

      {/* Открытые окна */}
      {openApps.map((app, i) => {
        const isFocused = focusedApp === app.id;
        return (
          <Win95Window
            key={app.id}
            app={app}
            onClose={handleCloseApp}
            onFocus={() => handleFocus(app.id)}
            isFocused={isFocused}
            zIndex={isFocused ? 9999 : i}
            onToggleMinimize={handleToggleMinimize}
            documents={documents}
            setDocuments={setDocuments}
            recycleBin={recycleBin}
            setRecycleBin={setRecycleBin}
            onOpenApp={handleOpenApp}
          />
        );
      })}

      {/* Таскбар */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-gray-300 flex items-center border-t border-gray-600">
        <Button
          className="bg-gray-200 text-black border-r border-gray-600 h-full rounded-none px-3 hover:bg-gray-400"
          onClick={() => setStartMenuOpen(!startMenuOpen)}
        >
          Start
        </Button>
        {openApps.map((app) => {
          const isFocusedApp = focusedApp === app.id && !app.isMinimized;
          return (
            <TaskbarAppButton
              key={app.id}
              app={app}
              isFocused={isFocusedApp}
              onClick={() => {
                if (app.isMinimized) {
                  handleToggleMinimize(app.id);
                  setFocusedApp(app.id);
                } else {
                  if (focusedApp === app.id) {
                    handleToggleMinimize(app.id);
                  } else {
                    setFocusedApp(app.id);
                  }
                }
              }}
            />
          );
        })}
        <div className="flex-1" />
        <SystemClock />
      </div>

      <StartMenu
        isOpen={startMenuOpen}
        onClose={() => setStartMenuOpen(false)}
        onOpenApp={handleOpenApp}
      />
    </div>
  );
}

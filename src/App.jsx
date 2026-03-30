import { useState, useRef, useEffect, useCallback } from "react";
import { useFonts, useAuth } from "./hooks/index.js";
import { loginURL, logoutURL } from "./api.js";
import { THEMES }               from "./constants/themes.js";
import { FONTS }                from "./constants/fonts.js";
import { ThemeSwitcher, Icon }    from "./components/ui/index.js";
import { TwoSum }                  from "./components/twosum/index.js";
import { MergeSortedArrays }       from "./components/merge/index.js";
import { LongestSubstring }        from "./components/substring/index.js";
import { ContainerWater }          from "./components/container/index.js";
import { TwoSumII }                from "./components/twosum2/index.js";
import { IsPalindrome }            from "./components/palindrome/index.js";
import { SimplifyPath }            from "./components/simplify/index.js";
import { Candy }                   from "./components/candy/index.js";
import { FindSubstring }           from "./components/substring2/index.js";
import { MazeSolver }              from "./components/maze/index.js";
import { IsValidSudoku }           from "./components/sudoku/index.js";
import { LongestConsecutive }      from "./components/consecutive/index.js";
import { ReverseWords }            from "./components/reversewords/index.js";
import { ArrowShots }              from "./components/arrows/index.js";
import { WordSearch }              from "./components/wordsearch/index.js";
import { LinkedCycle }             from "./components/linkedcycle/index.js";
import { NumIslands }              from "./components/islands/index.js";
import { Calculator }              from "./components/calculator/index.js";
import { SnakesLadders }           from "./components/snakes/index.js";
import { LIS }                     from "./components/lis/index.js";
import { MaxProfit }               from "./components/maxprofit/index.js";
import { RustBinarySearch }        from "./components/rustlet/index.js";
import { RustBubbleSort }          from "./components/rustbubble/index.js";
import "./styles/animations.css";

const { mono, display } = FONTS;

const TABS = [
  { id:"twosum",     label:"twoSum( )",         icon:"target-bold",                  desc:"Hash map",       algo:"hash map",       color:"#f97316", Component:TwoSum            },
  { id:"merge",      label:"mergeSorted( )",     icon:"sort-by-time-bold",            desc:"Two pointer",    algo:"two pointer",    color:"#22c55e", Component:MergeSortedArrays },
  { id:"substring",  label:"longestSubstr( )",   icon:"window-bold",                  desc:"Sliding window", algo:"sliding window", color:"#c084fc", Component:LongestSubstring  },
  { id:"container",  label:"maxArea( )",         icon:"cup-hot-bold",                 desc:"Two pointer",    algo:"two pointer",    color:"#38bdf8", Component:ContainerWater    },
  { id:"twosum2",    label:"twoSum II( )",       icon:"double-alt-arrow-right-bold",  desc:"Two pointer",    algo:"two pointer",    color:"#fb923c", Component:TwoSumII          },
  { id:"palindrome", label:"isPalindrome( )",    icon:"mirror-left-bold",             desc:"Two pointer",    algo:"two pointer",    color:"#a78bfa", Component:IsPalindrome      },
  { id:"simplify",   label:"simplifyPath( )",    icon:"folder-open-bold",             desc:"Stack",          algo:"stack",          color:"#34d399", Component:SimplifyPath      },
  { id:"candy",      label:"candy( )",           icon:"candy-bold",                   desc:"Greedy",         algo:"greedy",         color:"#f472b6", Component:Candy             },
  { id:"substring2", label:"findSubstring( )",   icon:"magnifer-bold",                desc:"Sliding window", algo:"sliding window", color:"#818cf8", Component:FindSubstring     },
  { id:"maze",       label:"maze BFS( )",        icon:"map-bold",                     desc:"BFS",            algo:"bfs graph",      color:"#2dd4bf", Component:MazeSolver        },
  { id:"sudoku",     label:"isValidSudoku( )",   icon:"hashtag-bold",                desc:"Hash set  O(1)",         color:"#e879f9", Component:IsValidSudoku     },
  { id:"consecutive",  label:"longestConsec( )",  icon:"ruler-bold",                  desc:"Hash set  O(n)",         color:"#facc15", Component:LongestConsecutive },
  { id:"reversewords",  label:"reverseWords( )",  icon:"transfer-horizontal-bold",    desc:"Two pointer  O(n)",      color:"#f87171", Component:ReverseWords       },
  { id:"arrows",       label:"minArrowShots( )", icon:"arrow-down-bold",             desc:"Greedy  O(n log n)",     color:"#fb923c", Component:ArrowShots         },
  { id:"wordsearch",   label:"findWords( )",     icon:"branching-paths-up-bold",     desc:"Trie + DFS  O(m·n·4^L)", color:"#a3e635", Component:WordSearch         },
  { id:"linkedcycle",  label:"hasCycle( )",      icon:"link-circle-bold",            desc:"Floyd slow/fast  O(n)",  color:"#22c55e", Component:LinkedCycle        },
  { id:"islands",      label:"numIslands( )",    icon:"map-point-bold",              desc:"DFS flood-fill  O(m·n)", color:"#0ea5e9", Component:NumIslands         },
  { id:"calculator",   label:"calculate( )",     icon:"calculator-bold",             desc:"Stack  O(n)",            color:"#e879f9", Component:Calculator         },
  { id:"snakes",       label:"snakesLadders( )", icon:"map-point-bold",              desc:"BFS  O(n²)",             color:"#4ade80", Component:SnakesLadders      },
  { id:"lis",          label:"lengthOfLIS( )",   icon:"graph-new-up-bold",           desc:"Patience sort  O(n log n)",color:"#fb923c", Component:LIS                },
  { id:"maxprofit",    label:"maxProfit( )",     icon:"chart-2-bold",                desc:"State machine  O(n)",    color:"#facc15", Component:MaxProfit          },
  { id:"rustlet",      label:"binarySearch( )",  icon:"code-bold",                   desc:"let · Binary search  O(log n) · Rust", algo:"binary search rust", color:"#f84f39", Component:RustBinarySearch   },
  { id:"rustbubble",   label:"bubbleSort( )",    icon:"sort-by-number-bold",          desc:"&mut Vec · Bubble sort  O(n²) · Rust",  algo:"bubble sort rust",   color:"#ce412b", Component:RustBubbleSort     },
];

const ITEM_H   = 52;
const VISIBLE  = 7;
const ROLLER_H = ITEM_H * VISIBLE;

// ── useWindowWidth ────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

// ── Roller ────────────────────────────────────────────────────────
function Roller({ tabs, activeIdx, onChange, T }) {
  const trackRef = useRef(null);
  const ticking  = useRef(false);
  const fromUser = useRef(false);
  const lastIdx  = useRef(activeIdx);

  const scrollTo = useCallback((idx, smooth = true) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ top: idx * ITEM_H, behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    if (fromUser.current) { fromUser.current = false; return; }
    scrollTo(activeIdx, false);
    lastIdx.current = activeIdx;
  }, [activeIdx, scrollTo]);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const el = trackRef.current;
      if (!el) return;
      const idx     = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(tabs.length - 1, idx));
      if (clamped !== lastIdx.current) {
        lastIdx.current  = clamped;
        fromUser.current = true;
        onChange(clamped);
      }
    });
  }, [tabs.length, onChange]);

  const handleClick = useCallback((i) => {
    fromUser.current = true;
    lastIdx.current  = i;
    onChange(i);
    scrollTo(i);
  }, [onChange, scrollTo]);

  return (
    <div style={{ position:"relative", height:ROLLER_H, width:"100%" }}>
      {/* Selection band */}
      <div style={{
        position:"absolute",
        top: ITEM_H * Math.floor(VISIBLE / 2),
        left:8, right:8, height:ITEM_H,
        background: `${tabs[activeIdx]?.color ?? "#888"}16`,
        border: `1px solid ${tabs[activeIdx]?.color ?? "#888"}50`,
        borderRadius:10,
        pointerEvents:"none",
        transition:"background 0.25s, border-color 0.25s",
        zIndex:1,
      }} />
      <div className="roller-mask" style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"none" }} />
      <div
        ref={trackRef}
        className="roller-track"
        onScroll={handleScroll}
        style={{
          position:"absolute", inset:0,
          paddingTop:    ITEM_H * Math.floor(VISIBLE / 2),
          paddingBottom: ITEM_H * Math.floor(VISIBLE / 2),
        }}
      >
        {tabs.map((tab, i) => {
          const dist     = Math.abs(i - activeIdx);
          const isActive = i === activeIdx;
          const scale    = isActive ? 1 : Math.max(0.74, 1 - dist * 0.09);
          const opacity  = isActive ? 1 : Math.max(0.15, 1 - dist * 0.25);
          return (
            <div
              key={tab.id}
              className="roller-item"
              onClick={() => handleClick(i)}
              style={{
                height:ITEM_H,
                display:"flex", alignItems:"center", gap:9,
                padding:"0 14px",
                transform:`scale(${scale})`, opacity,
                transition:"transform 0.14s, opacity 0.14s",
                transformOrigin:"left center",
              }}
            >
              <div style={{
                width:28, height:28, borderRadius:8, flexShrink:0,
                background: isActive ? `${tab.color}22` : "transparent",
                border:`1.5px solid ${isActive ? tab.color : "transparent"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.2s",
              }}>
                <Icon name={tab.icon} size={14} style={{ color: isActive ? tab.color : T.textDim }} />
              </div>
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{
                  color: isActive ? tab.color : T.textMid,
                  fontSize:12, fontWeight: isActive ? 700 : 400,
                  fontFamily:mono, whiteSpace:"nowrap",
                  overflow:"hidden", textOverflow:"ellipsis",
                  transition:"color 0.2s",
                }}>
                  {tab.label}
                </div>
                {isActive && (
                  <div style={{
                    color:T.textDim, fontSize:9, fontFamily:mono,
                    display:"flex", alignItems:"center", gap:3, marginTop:1, opacity:0.8,
                  }}>
                    <Icon name="cpu-bolt-bold" size={8} /> {tab.desc}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SearchResults ─────────────────────────────────────────────────

// ── Sidebar ───────────────────────────────────────────────────────
function Sidebar({ tabs, activeIdx, onSelect, themeKey, setThemeKey, tabColor, T, mode }) {
  const [query,       setQuery]       = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef(null);

  const q       = query.toLowerCase().trim();
  const results = q
    ? tabs.filter(t =>
        t.label.toLowerCase().includes(q) ||
        t.desc.toLowerCase().includes(q)  ||
        (t.algo ?? "").toLowerCase().includes(q)  ||
        t.id.toLowerCase().includes(q)
      )
    : [];
  const searching = q.length > 0;

  const handleSelect = useCallback((tab) => {
    const idx = tabs.indexOf(tab);
    onSelect(idx);
    setQuery("");
    setSidebarOpen(false);
  }, [tabs, onSelect]);

  // icon-rail mode (mid-width)
  if (mode === "rail") {
    return (
      <div style={{
        width:52, flexShrink:0,
        display:"flex", flexDirection:"column", alignItems:"center",
        borderRight:`1px solid ${T.border}`,
        background:T.surface,
        position:"sticky", top:0, height:"100vh",
        overflow:"hidden", paddingTop:12, paddingBottom:12, gap:6,
      }}>
        {tabs.map((tab, i) => {
          const isActive = i === activeIdx;
          return (
            <button key={tab.id} className="tbtn" onClick={() => onSelect(i)} title={tab.label} style={{
              width:36, height:36, borderRadius:9, flexShrink:0,
              background: isActive ? `${tab.color}22` : "transparent",
              border:`1.5px solid ${isActive ? tab.color : "transparent"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Icon name={tab.icon} size={15} style={{ color: isActive ? tab.color : T.textDim }} />
            </button>
          );
        })}
        <div style={{ marginTop:"auto" }}>
          <ThemeSwitcher themeKey={themeKey} setThemeKey={setThemeKey} color={tabColor} T={T} compact />
        </div>
      </div>
    );
  }

  // collapsed mode (narrow) — hamburger + overlay
  if (mode === "hidden") {
    return (
      <>
        {/* Floating hamburger */}
        <button
          className="tbtn"
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            position:"fixed", top:12, left:12, zIndex:100,
            width:38, height:38, borderRadius:10,
            background:T.surface, border:`1px solid ${T.border}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:`0 4px 16px rgba(0,0,0,0.3)`,
          }}
        >
          <Icon name={sidebarOpen ? "close-circle-bold" : "hamburger-menu-bold"} size={16} style={{ color:tabColor }} />
        </button>

        {/* Overlay */}
        {sidebarOpen && (
          <>
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position:"fixed", inset:0, zIndex:90, background:"rgba(0,0,0,0.5)" }}
            />
            <div style={{
              position:"fixed", top:0, left:0, bottom:0, width:220,
              zIndex:95,
              background:T.surface, borderRight:`1px solid ${T.border}`,
              display:"flex", flexDirection:"column",
              boxShadow:"4px 0 24px rgba(0,0,0,0.4)",
            }}>
              <SidebarContents
                tabs={tabs} activeIdx={activeIdx}
                handleSelect={handleSelect}
                searching={searching} query={query} setQuery={setQuery}
                results={results} searchRef={searchRef}
                themeKey={themeKey} setThemeKey={setThemeKey}
                tabColor={tabColor} T={T} mode="hidden"
              />
            </div>
          </>
        )}
      </>
    );
  }

  // full mode
  return (
    <div style={{
      width:192, flexShrink:0,
      display:"flex", flexDirection:"column",
      borderRight:`1px solid ${T.border}`,
      background:T.surface,
      position:"sticky", top:0, height:"100vh", overflow:"hidden",
    }}>
      <SidebarContents
        tabs={tabs} activeIdx={activeIdx}
        handleSelect={handleSelect}
        searching={searching} query={query} setQuery={setQuery}
        results={results} searchRef={searchRef}
        themeKey={themeKey} setThemeKey={setThemeKey}
        tabColor={tabColor} T={T} mode="full"
      />
    </div>
  );
}

// ── SidebarContents (shared between full + overlay) ───────────────
function SidebarContents({ tabs, activeIdx, handleSelect, searching, query, setQuery, results, searchRef, themeKey, setThemeKey, tabColor, T, mode }) {
  const tab = tabs[activeIdx];
  return (
    <>
      {/* Brand */}
      <div style={{ padding:"16px 14px 12px", borderBottom:`1px solid ${T.border}`, flexShrink:0 }}>
        <div style={{ fontFamily:display, fontSize:15, fontWeight:800, letterSpacing:-0.5, color:T.text, lineHeight:1.15 }}>
          Algo<br/>
          <span style={{ color:tabColor, transition:"color 0.25s" }}>Debugger</span>
        </div>
        <div style={{ color:T.textDim, fontSize:9, marginTop:3, fontFamily:mono }}>step-by-step visualizer</div>
      </div>

      {/* Search input */}
      <div style={{ padding:"10px 10px 6px", flexShrink:0 }}>
        <div style={{
          display:"flex", alignItems:"center", gap:7,
          background:T.card, border:`1px solid ${searching ? tabColor+"88" : T.border}`,
          borderRadius:9, padding:"7px 10px",
          transition:"border-color 0.2s",
        }}>
          <Icon name="magnifer-bold" size={12} style={{ color: searching ? tabColor : T.textDim, flexShrink:0 }} />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="search algorithms…"
            style={{
              flex:1, background:"transparent", border:"none", outline:"none",
              color:T.text, fontSize:11, fontFamily:mono,
            }}
          />
          {searching && (
            <button className="tbtn" onClick={() => setQuery("")} style={{ padding:0, lineHeight:0 }}>
              <Icon name="close-circle-bold" size={12} style={{ color:T.textDim }} />
            </button>
          )}
        </div>
      </div>

      {/* Roller or search results */}
      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
        {searching ? (
          <SearchResults results={results} activeId={tab.id} onSelect={handleSelect} T={T} />
        ) : (
          <div style={{ padding:"4px 0" }}>
            <Roller
              tabs={tabs}
              activeIdx={activeIdx}
              onChange={i => handleSelect(tabs[i])}
              T={T}
            />
          </div>
        )}
      </div>

      {/* Theme + User */}
      <div style={{ padding:"10px 14px", borderTop:`1px solid ${T.border}`, flexShrink:0, display:"flex", flexDirection:"column", gap:8 }}>
        <ThemeSwitcher themeKey={themeKey} setThemeKey={setThemeKey} color={tabColor} T={T} />
        {mode !== "rail" && <UserWidget T={T} color={tabColor} />}
      </div>
    </>
  );
}

// ── SearchResults ─────────────────────────────────────────────────
function SearchResults({ results, activeId, onSelect, T }) {
  if (results.length === 0) {
    return (
      <div style={{ padding:"20px 14px", color:T.textDim, fontSize:11, fontFamily:mono, textAlign:"center" }}>
        no matches
      </div>
    );
  }
  return (
    <div style={{ overflowY:"auto", flex:1, padding:"4px 6px" }}>
      {results.map(tab => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            className="search-result-item"
            onClick={() => onSelect(tab)}
            style={{
              background: isActive ? `${tab.color}18` : "transparent",
              border:`1.5px solid ${isActive ? tab.color : "transparent"}`,
              borderRadius: 8,
            }}
          >
            <div style={{
              width:26, height:26, borderRadius:7, flexShrink:0,
              background:`${tab.color}20`,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Icon name={tab.icon} size={13} style={{ color:tab.color }} />
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ color: isActive ? tab.color : T.textMid, fontSize:11, fontWeight: isActive ? 700 : 400, fontFamily:mono, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {tab.label}
              </div>
              <div style={{ color:T.textDim, fontSize:9, fontFamily:mono }}>{tab.desc} · {tab.algo}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── UserWidget ────────────────────────────────────────────────────
function UserWidget({ T, color }) {
  const user = useAuth();

  if (user === undefined) return null; // loading — show nothing

  if (!user) {
    return (
      <a
        href={loginURL}
        style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"8px 12px", borderRadius:9,
          background:`${color}18`, border:`1px solid ${color}40`,
          color, fontSize:11, fontFamily:mono, fontWeight:600,
          textDecoration:"none", transition:"background 0.2s",
        }}
      >
        <Icon name="login-2-bold" size={14} />
        Sign in
      </a>
    );
  }

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join("") || user.email?.[0]?.toUpperCase() || "?";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{
        display:"flex", alignItems:"center", gap:8,
        padding:"6px 10px", borderRadius:9,
        background:T.card, border:`1px solid ${T.border}`,
      }}>
        {/* Avatar */}
        <div style={{
          width:26, height:26, borderRadius:"50%", flexShrink:0,
          background:`${color}30`, border:`1.5px solid ${color}60`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:10, fontWeight:700, color, fontFamily:mono,
        }}>
          {initials}
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ color:T.text, fontSize:11, fontWeight:600, fontFamily:mono, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {user.firstName || user.email?.split("@")[0] || "User"}
          </div>
          <div style={{ color:T.textDim, fontSize:9, fontFamily:mono, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {user.email}
          </div>
        </div>
      </div>
      <a
        href={logoutURL}
        style={{
          display:"flex", alignItems:"center", gap:6,
          padding:"5px 10px", borderRadius:8,
          background:"transparent", border:`1px solid ${T.border}`,
          color:T.textDim, fontSize:10, fontFamily:mono,
          textDecoration:"none", transition:"color 0.2s, border-color 0.2s",
        }}
      >
        <Icon name="logout-2-bold" size={12} />
        Sign out
      </a>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  useFonts();

  const [themeKey,  setThemeKey]  = useState("dark");
  const [activeIdx, setActiveIdx] = useState(0);

  const T        = THEMES[themeKey];
  const tab      = TABS[activeIdx];
  const tabColor = tab.color;
  const winW     = useWindowWidth();

  // sidebar mode based on window width
  const sidebarMode = winW >= 820 ? "full" : winW >= 580 ? "rail" : "hidden";
  const contentPad  = sidebarMode === "hidden" ? "56px 14px 20px" : "20px 18px";

  return (
    <div style={{
      minHeight:"100vh",
      background:T.bg, color:T.text,
      fontFamily:mono,
      transition:"background 0.3s, color 0.3s",
      display:"flex",
    }}>
      <Sidebar
        tabs={TABS}
        activeIdx={activeIdx}
        onSelect={setActiveIdx}
        themeKey={themeKey}
        setThemeKey={setThemeKey}
        tabColor={tabColor}
        T={T}
        mode={sidebarMode}
      />

      {/* Main content */}
      <div style={{ flex:1, minWidth:0, padding:contentPad, overflowY:"auto" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div key={tab.id} className="fade-tab">
            <tab.Component T={T} />
          </div>
        </div>
      </div>
    </div>
  );
}

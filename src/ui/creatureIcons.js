const S = 'stroke="#2e2118" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
const S_THIN = 'stroke="#2e2118" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"';

const CREATURE_SVG_BODY = {
  // ==================== INSECTS (24 UNIQUE ILLUSTRATIONS) ====================

  // 1. 紋白蝶
  cabbage_butterfly: `
    <path d="M29 22 Q24 12 20 10 M35 22 Q40 12 44 10" fill="none" ${S_THIN}/>
    <circle cx="20" cy="10" r="2" fill="#3a3a3a"/>
    <circle cx="44" cy="10" r="2" fill="#3a3a3a"/>
    <path d="M30 28 C18 14, 5 18, 8 31 C10 38, 22 39, 30 34 Z" fill="#fefae0" ${S}/>
    <path d="M34 28 C46 14, 59 18, 56 31 C54 38, 42 39, 34 34 Z" fill="#fefae0" ${S}/>
    <path d="M30 35 C18 35, 11 45, 17 52 C22 57, 29 51, 31 42 Z" fill="#f5ecc4" ${S}/>
    <path d="M34 35 C46 35, 53 45, 47 52 C42 57, 35 51, 33 42 Z" fill="#f5ecc4" ${S}/>
    <path d="M10 21 C8 24, 8 28, 10 30 L17 22 C14 20, 12 20, 10 21 Z" fill="#3c3c3c"/>
    <path d="M54 21 C56 24, 56 28, 54 30 L47 22 C50 20, 52 20, 54 21 Z" fill="#3c3c3c"/>
    <circle cx="19" cy="29" r="3.1" fill="#3c3c3c"/>
    <circle cx="45" cy="29" r="3.1" fill="#3c3c3c"/>
    <circle cx="22" cy="43" r="1.9" fill="#595959"/>
    <circle cx="42" cy="43" r="1.9" fill="#595959"/>
    <ellipse cx="32" cy="34" rx="3.2" ry="11" fill="#525049" ${S_THIN}/>
    <circle cx="32" cy="22" r="3" fill="#525049" ${S_THIN}/>
  `,

  // 2. 七星瓢蟲
  ladybug: `
    <path d="M16 26 L9 22 M14 36 L7 38 M17 46 L11 52 M48 26 L55 22 M50 36 L57 38 M47 46 L53 52" fill="none" stroke="#261c17" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M27 16 Q24 9 20 8 M37 16 Q40 9 44 8" fill="none" ${S_THIN}/>
    <circle cx="20" cy="8" r="1.8" fill="#1e1917"/>
    <circle cx="44" cy="8" r="1.8" fill="#1e1917"/>
    <ellipse cx="32" cy="21" rx="11" ry="8" fill="#231f1e" ${S}/>
    <circle cx="26" cy="20" r="2.7" fill="#fffdf6"/>
    <circle cx="38" cy="20" r="2.7" fill="#fffdf6"/>
    <ellipse cx="32" cy="39" rx="19" ry="18" fill="#e63946" ${S}/>
    <ellipse cx="25" cy="33" rx="4.5" ry="7.5" fill="#ff7c85" opacity="0.45" transform="rotate(-18 25 33)"/>
    <line x1="32" y1="22" x2="32" y2="57" stroke="#1e1917" stroke-width="2.2"/>
    <circle cx="32" cy="26" r="3.4" fill="#1e1917"/>
    <circle cx="22" cy="31" r="3.2" fill="#1e1917"/>
    <circle cx="42" cy="31" r="3.2" fill="#1e1917"/>
    <circle cx="19" cy="42" r="3.3" fill="#1e1917"/>
    <circle cx="45" cy="42" r="3.3" fill="#1e1917"/>
    <circle cx="25" cy="50" r="2.9" fill="#1e1917"/>
    <circle cx="39" cy="50" r="2.9" fill="#1e1917"/>
  `,

  // 3. 帝王斑蝶
  monarch_butterfly: `
    <path d="M29 22 Q24 11 19 9 M35 22 Q40 11 45 9" fill="none" ${S_THIN}/>
    <path d="M30 27 C16 10, 4 14, 6 29 C8 38, 21 39, 30 34 Z" fill="#1e1917" ${S}/>
    <path d="M34 27 C48 10, 60 14, 58 29 C56 38, 43 39, 34 34 Z" fill="#1e1917" ${S}/>
    <path d="M30 35 C17 34, 9 45, 16 54 C22 60, 29 52, 31 42 Z" fill="#1e1917" ${S}/>
    <path d="M34 35 C47 34, 55 45, 48 54 C42 60, 35 52, 33 42 Z" fill="#1e1917" ${S}/>
    <path d="M29 29 C20 18, 11 20, 12 29 C13 35, 22 35, 29 32 Z" fill="#f48c25"/>
    <path d="M35 29 C44 18, 53 20, 52 29 C51 35, 42 35, 35 32 Z" fill="#f48c25"/>
    <path d="M29 37 C21 37, 15 44, 19 50 C23 54, 28 48, 30 41 Z" fill="#e66d1c"/>
    <path d="M35 37 C43 37, 49 44, 45 50 C41 54, 36 48, 34 41 Z" fill="#e66d1c"/>
    <path d="M28 30 L13 24 M28 31 L14 31 M36 30 L51 24 M36 31 L50 31 M28 40 L18 47 M36 40 L46 47" stroke="#1e1917" stroke-width="1.6"/>
    <circle cx="9" cy="21" r="1.4" fill="#ffffff"/>
    <circle cx="8" cy="27" r="1.4" fill="#ffffff"/>
    <circle cx="55" cy="21" r="1.4" fill="#ffffff"/>
    <circle cx="56" cy="27" r="1.4" fill="#ffffff"/>
    <circle cx="15" cy="51" r="1.3" fill="#ffffff"/>
    <circle cx="49" cy="51" r="1.3" fill="#ffffff"/>
    <ellipse cx="32" cy="34" rx="3" ry="12" fill="#231e1c"/>
    <circle cx="32" cy="22" r="3" fill="#231e1c"/>
    <circle cx="31" cy="21" r="0.9" fill="#fff"/>
    <circle cx="33" cy="21" r="0.9" fill="#fff"/>
  `,

  // 4. 紅蜻蜓
  red_dragonfly: `
    <path d="M34 25 C20 12, 6 12, 8 19 C10 24, 24 28, 33 28 Z" fill="#dff6ff" fill-opacity="0.82" ${S_THIN}/>
    <path d="M38 29 C52 16, 60 22, 56 28 C52 33, 41 33, 37 31 Z" fill="#dff6ff" fill-opacity="0.82" ${S_THIN}/>
    <path d="M31 30 C16 26, 6 32, 10 37 C14 41, 26 37, 32 33 Z" fill="#cdeeff" fill-opacity="0.78" ${S_THIN}/>
    <path d="M35 33 C48 34, 56 42, 50 46 C44 49, 36 41, 34 35 Z" fill="#cdeeff" fill-opacity="0.78" ${S_THIN}/>
    <line x1="12" y1="16" x2="17" y2="18" stroke="#5e2420" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="52" y1="22" x2="48" y2="25" stroke="#5e2420" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M35 28 L14 55" stroke="#d9483b" stroke-width="5.2" stroke-linecap="round"/>
    <path d="M35 28 L14 55" stroke="#2e2118" stroke-width="6.8" stroke-linecap="round" opacity="0.22"/>
    <path d="M35 28 L14 55" stroke="#d9483b" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M30 34 L27 38 M24 42 L21 46 M18 50 L15 54" stroke="#8c1f16" stroke-width="2.8" stroke-linecap="round"/>
    <ellipse cx="38" cy="24" rx="5.8" ry="7.2" fill="#d9483b" transform="rotate(38 38 24)" ${S}/>
    <circle cx="44" cy="17" r="4.6" fill="#9c2219" ${S_THIN}/>
    <circle cx="41.5" cy="14" r="3.4" fill="#c9362b" ${S_THIN}/>
    <circle cx="47.5" cy="18.5" r="3.4" fill="#c9362b" ${S_THIN}/>
    <circle cx="42.3" cy="13.2" r="1.1" fill="#fff" opacity="0.7"/>
    <circle cx="48.2" cy="17.8" r="1.1" fill="#fff" opacity="0.7"/>
  `,

  // 5. 雨天蝸牛
  snail: `
    <path d="M44 37 L50 22 M49 38 L56 26" fill="none" stroke="#dfc2a3" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M44 37 L50 22 M49 38 L56 26" fill="none" ${S_THIN}/>
    <circle cx="50" cy="21" r="2.7" fill="#231c18"/>
    <circle cx="56" cy="25" r="2.7" fill="#231c18"/>
    <circle cx="50.8" cy="20.2" r="0.9" fill="#fff"/>
    <circle cx="56.8" cy="24.2" r="0.9" fill="#fff"/>
    <path d="M10 49 C16 47, 25 46, 36 45 C45 44, 48 37, 52 39 C56 41, 56 49, 49 51 C38 54, 17 54, 10 51 Z" fill="#f1dec9" ${S}/>
    <circle cx="28" cy="34" r="16.5" fill="#c89464" ${S}/>
    <path d="M28 19 A15 15 0 1 1 15 39" fill="none" stroke="#82502c" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M29 24 A10 10 0 1 1 20 38 A7 7 0 1 1 32 34 A3.5 3.5 0 1 1 26 33" fill="none" stroke="#593318" stroke-width="2.3" stroke-linecap="round"/>
    <circle cx="22" cy="25" r="2.4" fill="#ffe6cc" opacity="0.6"/>
  `,

  // 6. 鈴蟲
  cricket: `
    <path d="M42 20 C49 10, 56 8, 60 11 M40 18 C43 7, 48 5, 53 6" fill="none" ${S_THIN}/>
    <path d="M22 44 L14 54 M26 47 L22 57" fill="none" ${S_THIN}/>
    <path d="M26 35 L15 24 L10 46" fill="none" stroke="#2e2118" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M35 39 L28 53 L39 55" fill="none" stroke="#2e2118" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M30 27 L23 19" fill="none" ${S}/>
    <path d="M38 30 L49 34" fill="none" ${S}/>
    <path d="M42 22 C34 22, 23 28, 19 39 C17 44, 21 49, 27 48 C36 46, 44 37, 46 27 Z" fill="#4f3b2c" ${S}/>
    <path d="M40 24 C32 25, 24 31, 22 40 C26 43, 35 39, 41 30 Z" fill="#6e533f" ${S_THIN}/>
    <path d="M27 37 Q32 33 36 28 M29 41 Q35 37 39 32" fill="none" stroke="#36261b" stroke-width="1.2"/>
    <circle cx="44" cy="22" r="5.2" fill="#3a2a1e" ${S}/>
    <circle cx="46" cy="21" r="1.5" fill="#18120e"/>
    <path d="M12 16 L12 10 L17 9 L17 15" fill="none" stroke="#e09f3e" stroke-width="1.7" stroke-linecap="round"/>
    <circle cx="10.8" cy="16.5" r="1.8" fill="#e09f3e"/>
    <circle cx="15.8" cy="15.5" r="1.8" fill="#e09f3e"/>
  `,

  // 7. 珊瑚寄居蟹
  hermit_crab: `
    <path d="M28 45 L22 55 M35 46 L34 56 M44 45 L51 54" fill="none" stroke="#e05634" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M28 45 L22 55 M35 46 L34 56 M44 45 L51 54" fill="none" ${S_THIN}/>
    <path d="M10 38 C8 25, 18 11, 31 12 C40 13, 45 21, 41 31 C36 40, 17 45, 10 38 Z" fill="#ffb8a8" ${S}/>
    <path d="M14 34 C14 23, 22 15, 32 16 M18 39 C22 30, 31 23, 40 24" fill="none" stroke="#e07a5f" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M12 25 C15 18, 22 14, 28 14" fill="none" stroke="#fff4eb" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="38" cy="39" rx="10" ry="7.5" fill="#f7704a" ${S}/>
    <path d="M36 33 L35 25 M43 33 L45 25" fill="none" stroke="#f7704a" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="35" cy="24" r="2.8" fill="#231c18"/>
    <circle cx="45" cy="24" r="2.8" fill="#231c18"/>
    <circle cx="35.8" cy="23.2" r="0.9" fill="#fff"/>
    <circle cx="45.8" cy="23.2" r="0.9" fill="#fff"/>
    <path d="M29 41 C20 39, 17 47, 23 51 C29 54, 34 48, 32 43 Z" fill="#e8482e" ${S}/>
    <path d="M47 40 C55 38, 58 45, 52 49 C47 52, 44 46, 46 42 Z" fill="#f05a38" ${S}/>
  `,

  // 8. 獨角仙
  rhino_beetle: `
    <path d="M21 32 L11 27 M19 42 L10 44 M22 50 L14 57 M43 32 L53 27 M45 42 L54 44 M42 50 L50 57" fill="none" stroke="#36190d" stroke-width="2.8" stroke-linecap="round"/>
    <ellipse cx="32" cy="43" rx="13.5" ry="15" fill="#6b3419" ${S}/>
    <line x1="32" y1="29" x2="32" y2="58" stroke="#2e150a" stroke-width="1.8"/>
    <ellipse cx="26" cy="40" rx="3" ry="6.5" fill="#9c5633" opacity="0.45" transform="rotate(-10 26 40)"/>
    <ellipse cx="32" cy="27" rx="11.5" ry="7.5" fill="#4a2210" ${S}/>
    <path d="M32 23 L32 10 M32 12 L25 6 M32 12 L39 6" fill="none" stroke="#2c1308" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M32 22 L32 11 M32 12 L26 7 M32 12 L38 7" fill="none" stroke="#613019" stroke-width="1.8" stroke-linecap="round"/>
    <polygon points="32,20 29,25 35,25" fill="#2c1308"/>
  `,

  // 9. 深山鍬形蟲
  miyama_stag: `
    <path d="M22 33 L12 28 M20 43 L11 45 M22 51 L14 57 M42 33 L52 28 M44 43 L53 45 M42 51 L50 57" fill="none" stroke="#362115" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="16" cy="30" r="2.2" fill="#d49b38"/>
    <circle cx="48" cy="30" r="2.2" fill="#d49b38"/>
    <circle cx="15" cy="44" r="2.2" fill="#d49b38"/>
    <circle cx="49" cy="44" r="2.2" fill="#d49b38"/>
    <ellipse cx="32" cy="44" rx="12" ry="14" fill="#593a27" ${S}/>
    <line x1="32" y1="31" x2="32" y2="58" stroke="#2a190f" stroke-width="1.6"/>
    <rect x="22" y="27" width="20" height="9" rx="4" fill="#452c1d" ${S}/>
    <path d="M20 24 L17 20 L23 19 L41 19 L47 20 L44 24 L42 28 L22 28 Z" fill="#382216" ${S}/>
    <path d="M25 20 C20 14, 21 8, 28 5 M25 13 L29 14 M28 5 L25 9" fill="none" stroke="#2b190f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M39 20 C44 14, 43 8, 36 5 M39 13 L35 14 M36 5 L39 9" fill="none" stroke="#2b190f" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // 10. 翡翠鳳蝶
  tropical_swallowtail: `
    <path d="M29 20 Q25 11 21 9 M35 20 Q39 11 43 9" fill="none" ${S_THIN}/>
    <path d="M30 26 C15 10, 4 14, 7 29 C9 36, 21 38, 30 33 Z" fill="#172422" ${S}/>
    <path d="M34 26 C49 10, 60 14, 57 29 C55 36, 43 38, 34 33 Z" fill="#172422" ${S}/>
    <path d="M30 33 C17 34, 11 43, 17 50 L14 58 L20 57 L23 51 C27 51, 30 46, 31 39 Z" fill="#172422" ${S}/>
    <path d="M34 33 C47 34, 53 43, 47 50 L50 58 L44 57 L41 51 C37 51, 34 46, 33 39 Z" fill="#172422" ${S}/>
    <path d="M28 28 C21 20, 13 21, 13 28 C14 33, 22 33, 28 31 Z" fill="#2ec4b6"/>
    <path d="M36 28 C43 20, 51 21, 51 28 C50 33, 42 33, 36 31 Z" fill="#2ec4b6"/>
    <path d="M28 36 C21 37, 17 43, 20 47 C24 49, 28 45, 29 39 Z" fill="#72efdd"/>
    <path d="M36 36 C43 37, 47 43, 44 47 C40 49, 36 45, 35 39 Z" fill="#72efdd"/>
    <circle cx="17" cy="56" r="1.6" fill="#72efdd"/>
    <circle cx="47" cy="56" r="1.6" fill="#72efdd"/>
    <ellipse cx="32" cy="32" rx="2.8" ry="11" fill="#141e1d"/>
  `,

  // 11. 櫻花蝶
  sakura_butterfly: `
    <path d="M29 22 Q25 13 21 11 M35 22 Q39 13 43 11" fill="none" stroke="#8a4458" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="21" cy="11" r="1.8" fill="#ffe08a"/>
    <circle cx="43" cy="11" r="1.8" fill="#ffe08a"/>
    <path d="M30 28 C22 15, 11 14, 9 22 L14 25 L8 29 C9 37, 21 38, 30 33 Z" fill="#ffc2d4" ${S}/>
    <path d="M34 28 C42 15, 53 14, 55 22 L50 25 L56 29 C55 37, 43 38, 34 33 Z" fill="#ffc2d4" ${S}/>
    <path d="M30 34 C19 35, 13 44, 19 52 L23 48 L26 53 C30 52, 31 46, 31 40 Z" fill="#ffb0c8" ${S}/>
    <path d="M34 34 C45 35, 51 44, 45 52 L41 48 L38 53 C34 52, 33 46, 33 40 Z" fill="#ffb0c8" ${S}/>
    <ellipse cx="22" cy="28" rx="5.5" ry="4" fill="#ff759f" opacity="0.72"/>
    <ellipse cx="42" cy="28" rx="5.5" ry="4" fill="#ff759f" opacity="0.72"/>
    <circle cx="22" cy="43" r="2.2" fill="#ffe08a"/>
    <circle cx="42" cy="43" r="2.2" fill="#ffe08a"/>
    <ellipse cx="32" cy="33" rx="2.8" ry="10.5" fill="#8a4458" ${S_THIN}/>
  `,

  // 12. 星夜流螢
  firefly: `
    <circle class="svg-glow" cx="32" cy="48" r="13" fill="#e9ff70" opacity="0.32"/>
    <circle class="svg-glow" cx="32" cy="48" r="8.5" fill="#e9ff70" opacity="0.5"/>
    <path d="M29 14 Q24 7 18 7 M35 14 Q40 7 46 7" fill="none" ${S_THIN}/>
    <path d="M29 27 C14 22, 6 28, 9 36 C12 42, 23 39, 29 34 Z" fill="#e2dfd2" fill-opacity="0.75" ${S_THIN}/>
    <path d="M35 27 C50 22, 58 28, 55 36 C52 42, 41 39, 35 34 Z" fill="#e2dfd2" fill-opacity="0.75" ${S_THIN}/>
    <path d="M29 24 C18 19, 12 23, 15 29 C18 33, 25 32, 29 30 Z" fill="#2d2b33" ${S_THIN}/>
    <path d="M35 24 C46 19, 52 23, 49 29 C46 33, 39 32, 35 30 Z" fill="#2d2b33" ${S_THIN}/>
    <ellipse cx="32" cy="35" rx="6.5" ry="11" fill="#2d2b33" ${S}/>
    <path d="M26 42 C26 51, 38 51, 38 42 Z" fill="#e9ff70" ${S_THIN}/>
    <ellipse cx="32" cy="21" rx="7" ry="5.5" fill="#e85a4f" ${S}/>
    <circle cx="32" cy="14" r="3.5" fill="#25232a" ${S_THIN}/>
    <circle cx="15" cy="49" r="1.8" fill="#f7ff9c"/>
    <circle cx="50" cy="46" r="1.5" fill="#f7ff9c"/>
  `,

  // 13. 蘭花螳螂
  orchid_mantis: `
    <path d="M29 12 Q24 5 18 6 M35 12 Q40 5 46 6" fill="none" stroke="#c45075" stroke-width="1.4" stroke-linecap="round"/>
    <ellipse cx="16" cy="38" rx="8" ry="4.5" fill="#ffb3cb" transform="rotate(-32 16 38)" ${S_THIN}/>
    <ellipse cx="48" cy="38" rx="8" ry="4.5" fill="#ffb3cb" transform="rotate(32 48 38)" ${S_THIN}/>
    <ellipse cx="18" cy="49" rx="7.5" ry="4.2" fill="#ffd6e3" transform="rotate(-16 18 49)" ${S_THIN}/>
    <ellipse cx="46" cy="49" rx="7.5" ry="4.2" fill="#ffd6e3" transform="rotate(16 46 49)" ${S_THIN}/>
    <path d="M32 32 C20 34, 17 47, 25 54 C29 57, 35 57, 39 54 C47 47, 44 34, 32 32 Z" fill="#fff4f8" ${S}/>
    <path d="M23 48 C26 54, 38 54, 41 48" fill="none" stroke="#f078a0" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M29 22 L35 22 L34 34 L30 34 Z" fill="#fff4f8" ${S_THIN}/>
    <path d="M28 24 L19 20 L22 30 M36 24 L45 20 L42 30" fill="none" stroke="#eb6b96" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <polygon points="32,23 24,13 40,13" fill="#ffd1e0" ${S}/>
    <circle cx="24.5" cy="14" r="2.7" fill="#7a324b"/>
    <circle cx="39.5" cy="14" r="2.7" fill="#7a324b"/>
  `,

  // 14. 彩虹吉丁蟲
  jewel_beetle: `
    <path d="M25 27 L15 22 M23 36 L14 38 M25 46 L16 52 M39 27 L49 22 M41 36 L50 38 M39 46 L48 52" fill="none" stroke="#0e5c4a" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M29 12 Q24 6 19 8 M35 12 Q40 6 45 8" fill="none" stroke="#d4a017" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M32 18 C40 18, 43 27, 42 40 C41 49, 36 56, 32 58 C28 56, 23 49, 22 40 C21 27, 24 18, 32 18 Z" fill="#18c79a" ${S}/>
    <path d="M27 24 L26 48 M37 24 L38 48" stroke="#e02898" stroke-width="3.2" stroke-linecap="round"/>
    <line x1="32" y1="22" x2="32" y2="56" stroke="#ffd166" stroke-width="2.2"/>
    <path d="M25 18 C25 13, 39 13, 39 18 L40 24 L24 24 Z" fill="#12a882" ${S}/>
    <circle cx="27" cy="14" r="1.9" fill="#1a1410"/>
    <circle cx="37" cy="14" r="1.9" fill="#1a1410"/>
    <circle cx="48" cy="15" r="1.8" fill="#ffd166"/>
  `,

  // 15. 大王花金龜
  goliath_beetle: `
    <path d="M19 32 L9 27 M17 42 L8 45 M20 51 L13 58 M45 32 L55 27 M47 42 L56 45 M44 51 L51 58" fill="none" stroke="#1e1917" stroke-width="3.2" stroke-linecap="round"/>
    <ellipse cx="32" cy="43" rx="15.5" ry="15" fill="#681f28" ${S}/>
    <polygon points="20,33 27,33 22,40" fill="#f7f4ec"/>
    <polygon points="44,33 37,33 42,40" fill="#f7f4ec"/>
    <line x1="32" y1="30" x2="32" y2="58" stroke="#360e13" stroke-width="1.8"/>
    <ellipse cx="32" cy="24" rx="13.5" ry="9" fill="#f7f4ec" ${S}/>
    <path d="M24 17 L24 31 M29 15 L29 33 M35 15 L35 33 M40 17 L40 31" stroke="#1e1917" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="27" y="10" width="10" height="7" rx="3" fill="#f7f4ec" ${S_THIN}/>
    <path d="M29 11 L26 6 M35 11 L38 6" stroke="#1e1917" stroke-width="2.6" stroke-linecap="round"/>
  `,

  // 16. 彩虹鍬形蟲
  rainbow_stag: `
    <path d="M22 33 L12 28 M20 43 L11 45 M22 51 L14 57 M42 33 L52 28 M44 43 L53 45 M42 51 L50 57" fill="none" stroke="#1e5963" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="32" cy="44" rx="12.5" ry="13.5" fill="#d946ef" ${S}/>
    <ellipse cx="32" cy="43" rx="6.5" ry="11.5" fill="#2ec4b6" opacity="0.72"/>
    <line x1="32" y1="31" x2="32" y2="57" stroke="#ffbe3b" stroke-width="1.8"/>
    <ellipse cx="32" cy="27" rx="11.5" ry="6.8" fill="#18c7b7" ${S}/>
    <rect x="24" y="18" width="16" height="6.5" rx="3" fill="#ffbe3b" ${S_THIN}/>
    <path d="M26 19 C19 14, 19 8, 26 5" fill="none" stroke="#ffbe3b" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M38 19 C45 14, 45 8, 38 5" fill="none" stroke="#ffbe3b" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M26 19 C19 14, 19 8, 26 5" fill="none" stroke="#d946ef" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M38 19 C45 14, 45 8, 38 5" fill="none" stroke="#d946ef" stroke-width="1.5" stroke-linecap="round"/>
  `,

  // 17. 美他利佛細身鍬形蟲
  cyclommatus_stag: `
    <path d="M23 41 L13 38 M22 48 L12 51 M24 54 L16 60 M41 41 L51 38 M42 48 L52 51 M40 54 L48 60" fill="none" stroke="#755013" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="32" cy="49" rx="10" ry="10.5" fill="#c79232" ${S}/>
    <line x1="32" y1="39" x2="32" y2="59" stroke="#6b460f" stroke-width="1.5"/>
    <rect x="22" y="34" width="20" height="7" rx="3" fill="#9e6d1c" ${S}/>
    <rect x="20" y="27" width="24" height="8" rx="3" fill="#c79232" ${S}/>
    <path d="M25 27 L24 6 L28 9 M24 12 L27 13 M24 17 L27 18 M24 22 L27 23" fill="none" stroke="#b88224" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M39 27 L40 6 L36 9 M40 12 L37 13 M40 17 L37 18 M40 22 L37 23" fill="none" stroke="#b88224" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M25 27 L24 6 M39 27 L40 6" fill="none" stroke="#2e2118" stroke-width="1.1" stroke-linecap="round"/>
  `,

  // 18. 寶石聖甲蟲
  scarab_beetle: `
    <circle class="svg-glow" cx="32" cy="36" r="22" fill="#9d4edd" opacity="0.2"/>
    <path d="M19 32 L10 26 M17 41 L8 43 M20 50 L12 56 M45 32 L54 26 M47 41 L56 43 M44 50 L52 56" fill="none" stroke="#3c1361" stroke-width="2.8" stroke-linecap="round"/>
    <path d="M22 17 L25 10 L29 14 L32 8 L35 14 L39 10 L42 17 Z" fill="#ffd166" ${S_THIN}/>
    <ellipse cx="32" cy="42" rx="14.5" ry="15" fill="#7b2cbf" ${S}/>
    <ellipse cx="32" cy="25" rx="12" ry="7.5" fill="#5a189a" ${S}/>
    <line x1="32" y1="28" x2="32" y2="57" stroke="#ffd166" stroke-width="2.8"/>
    <path d="M19 34 Q32 38 45 34" fill="none" stroke="#ffd166" stroke-width="2.4"/>
    <ellipse cx="25" cy="40" rx="3" ry="6" fill="#c77dff" opacity="0.55" transform="rotate(-12 25 40)"/>
    <circle cx="13" cy="14" r="2" fill="#ffd166"/>
    <circle cx="52" cy="16" r="1.6" fill="#ffd166"/>
  `,

  // 19. 極光雪蛾
  snow_moth: `
    <path d="M28 21 L20 11 M25 17 L19 16 M23 14 L18 12 M36 21 L44 11 M39 17 L45 16 M41 14 L46 12" fill="none" stroke="#62b6cb" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M30 27 C15 13, 4 19, 7 32 C10 40, 22 40, 30 35 Z" fill="#eefaff" ${S}/>
    <path d="M34 27 C49 13, 60 19, 57 32 C54 40, 42 40, 34 35 Z" fill="#eefaff" ${S}/>
    <path d="M30 35 C17 35, 11 46, 17 53 C23 58, 29 51, 31 43 Z" fill="#dff6ff" ${S}/>
    <path d="M34 35 C47 35, 53 46, 47 53 C41 58, 35 51, 33 43 Z" fill="#dff6ff" ${S}/>
    <path d="M10 22 C8 27, 9 32, 12 35 M54 22 C56 27, 55 32, 52 35" fill="none" stroke="#72efdd" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="20" cy="29" r="4" fill="#c8b6ff" stroke="#72efdd" stroke-width="1.5"/>
    <circle cx="44" cy="29" r="4" fill="#c8b6ff" stroke="#72efdd" stroke-width="1.5"/>
    <circle cx="22" cy="45" r="2.6" fill="#72efdd"/>
    <circle cx="42" cy="45" r="2.6" fill="#72efdd"/>
    <ellipse cx="32" cy="34" rx="5.2" ry="12" fill="#ffffff" ${S_THIN}/>
  `,

  // 20. 南洋大兜蟲
  atlas_beetle: `
    <path d="M19 35 L10 30 M18 44 L9 46 M21 52 L14 58 M45 35 L54 30 M46 44 L55 46 M43 52 L50 58" fill="none" stroke="#18261a" stroke-width="2.8" stroke-linecap="round"/>
    <ellipse cx="32" cy="44" rx="14" ry="14.5" fill="#2e4f34" ${S}/>
    <line x1="32" y1="31" x2="32" y2="58" stroke="#142416" stroke-width="1.8"/>
    <ellipse cx="26" cy="42" rx="3.2" ry="6.5" fill="#7ea352" opacity="0.45" transform="rotate(-10 26 42)"/>
    <ellipse cx="32" cy="29" rx="12" ry="8" fill="#466b3c" ${S}/>
    <path d="M23 26 C13 21, 12 11, 22 6" fill="none" stroke="#19291c" stroke-width="3.8" stroke-linecap="round"/>
    <path d="M41 26 C51 21, 52 11, 42 6" fill="none" stroke="#19291c" stroke-width="3.8" stroke-linecap="round"/>
    <path d="M32 25 L32 8" fill="none" stroke="#19291c" stroke-width="4" stroke-linecap="round"/>
    <path d="M32 24 L32 10" fill="none" stroke="#62874c" stroke-width="1.5" stroke-linecap="round"/>
  `,

  // 21. 月神蛾
  lunar_moth: `
    <circle class="svg-glow" cx="32" cy="32" r="22" fill="#a8f9ff" opacity="0.22"/>
    <path d="M29 19 L22 10 M26 15 L21 15 M35 19 L42 10 M38 15 L43 15" fill="none" stroke="#e0b238" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M30 24 C15 9, 4 13, 6 26 C9 34, 21 35, 30 31 Z" fill="#a8f9ff" ${S}/>
    <path d="M34 24 C49 9, 60 13, 58 26 C55 34, 43 35, 34 31 Z" fill="#a8f9ff" ${S}/>
    <path d="M8 17 C16 14, 23 16, 29 22 M56 17 C48 14, 41 16, 35 22" fill="none" stroke="#c78fd1" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M30 32 C17 32, 12 40, 17 46 L14 59 L19 59 L22 48 C27 48, 30 43, 31 38 Z" fill="#8ef0fa" ${S}/>
    <path d="M34 32 C47 32, 52 40, 47 46 L50 59 L45 59 L42 48 C37 48, 34 43, 33 38 Z" fill="#8ef0fa" ${S}/>
    <circle cx="20" cy="25" r="3.4" fill="#fff0a5" stroke="#c78fd1" stroke-width="1.4"/>
    <circle cx="44" cy="25" r="3.4" fill="#fff0a5" stroke="#c78fd1" stroke-width="1.4"/>
    <circle cx="22" cy="40" r="2.4" fill="#fff0a5"/>
    <circle cx="42" cy="40" r="2.4" fill="#fff0a5"/>
    <ellipse cx="32" cy="30" rx="3.8" ry="10" fill="#f5feff" ${S_THIN}/>
  `,

  // 22. 長頸鹿鋸鍬形蟲
  giraffe_stag: `
    <path d="M23 41 L14 37 M22 48 L13 50 M24 54 L16 60 M41 41 L50 37 M42 48 L51 50 M40 54 L48 60" fill="none" stroke="#181716" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="32" cy="48" rx="10" ry="11.5" fill="#1e1d1c" ${S}/>
    <ellipse cx="28" cy="46" rx="2" ry="5.5" fill="#54514e" opacity="0.5"/>
    <rect x="23" y="34" width="18" height="7" rx="3" fill="#2b2927" ${S}/>
    <rect x="22" y="28" width="20" height="7" rx="3" fill="#181716" ${S}/>
    <path d="M25 29 C19 23, 21 19, 25 15 C28 11, 22 7, 29 4 M23 23 L27 22 M25 14 L28 14" fill="none" stroke="#1a1918" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M39 29 C45 23, 43 19, 39 15 C36 11, 42 7, 35 4 M41 23 L37 22 M39 14 L36 14" fill="none" stroke="#1a1918" stroke-width="3.3" stroke-linecap="round" stroke-linejoin="round"/>
  `,

  // 23. 赫克力士長戟大兜蟲
  hercules_beetle: `
    <path d="M18 46 L14 55 M27 47 L26 56 M36 45 L39 54" fill="none" stroke="#1a1715" stroke-width="3" stroke-linecap="round"/>
    <path d="M8 38 C8 27, 21 22, 33 27 C36 33, 35 44, 24 47 C14 49, 8 44, 8 38 Z" fill="#dcb03e" ${S}/>
    <circle cx="15" cy="34" r="2.2" fill="#1d1a16"/>
    <circle cx="23" cy="31" r="2.5" fill="#1d1a16"/>
    <circle cx="28" cy="39" r="2" fill="#1d1a16"/>
    <circle cx="18" cy="42" r="2.1" fill="#1d1a16"/>
    <ellipse cx="36" cy="35" rx="9" ry="10.5" fill="#1c1917" ${S}/>
    <path d="M37 28 C46 24, 53 21, 59 17" fill="none" stroke="#1c1917" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M43 27 L55 21" fill="none" stroke="#d4962c" stroke-width="2.2" stroke-dasharray="2 2"/>
    <path d="M40 39 C47 38, 52 34, 56 28 M48 35 L47 31" fill="none" stroke="#1c1917" stroke-width="3.6" stroke-linecap="round"/>
    <circle cx="38" cy="33" r="1.4" fill="#fff" opacity="0.5"/>
  `,

  // 24. 黃金鬼鍬形蟲
  golden_stag: `
    <circle class="svg-glow" cx="32" cy="35" r="23" fill="#ffd23f" opacity="0.22"/>
    <path d="M20 34 L11 29 M19 43 L10 46 M21 51 L13 57 M44 34 L53 29 M45 43 L54 46 M43 51 L51 57" fill="none" stroke="#b87e0e" stroke-width="2.8" stroke-linecap="round"/>
    <ellipse cx="32" cy="44" rx="13" ry="14" fill="#ffd23f" ${S}/>
    <ellipse cx="26" cy="41" rx="3" ry="7" fill="#fff5ba" opacity="0.7" transform="rotate(-12 26 41)"/>
    <line x1="32" y1="31" x2="32" y2="58" stroke="#9e6d08" stroke-width="1.8"/>
    <ellipse cx="32" cy="28" rx="12" ry="7" fill="#f0b429" ${S}/>
    <rect x="23" y="20" width="18" height="7" rx="3" fill="#ffd23f" ${S}/>
    <path d="M24 21 C15 17, 15 9, 27 6 M21 15 L25 16" fill="none" stroke="#e09f1f" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M40 21 C49 17, 49 9, 37 6 M43 15 L39 16" fill="none" stroke="#e09f1f" stroke-width="4.6" stroke-linecap="round"/>
    <path d="M24 21 C15 17, 15 9, 27 6 M40 21 C49 17, 49 9, 37 6" fill="none" stroke="#2e2118" stroke-width="1.3" stroke-linecap="round"/>
    <polygon points="11,11 12.5,14 15.5,15 12.5,16 11,19 9.5,16 6.5,15 9.5,14" fill="#ffdf6b"/>
    <polygon points="53,13 54,15 56,16 54,17 53,19 52,17 50,16 52,15" fill="#ffdf6b"/>
  `,

  // ==================== REPTILES (12 UNIQUE ILLUSTRATIONS) ====================

  // 1. 綠安樂蜥
  green_anole: `
    <path d="M26 39 C15 41, 10 49, 16 54 C21 57, 30 53, 35 55" fill="none" stroke="#47b84e" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M26 39 C15 41, 10 49, 16 54 C21 57, 30 53, 35 55" fill="none" ${S_THIN}/>
    <path d="M33 38 L29 48 M43 34 L46 44" fill="none" stroke="#3da343" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M45 27 C42 35, 51 39, 53 31 Z" fill="#ff5a36" ${S_THIN}/>
    <path d="M24 39 C30 33, 38 29, 44 26 C46 21, 52 19, 58 23 C54 27, 49 29, 45 31 C39 36, 33 41, 24 41 Z" fill="#5cc961" ${S}/>
    <circle cx="50" cy="23" r="2.2" fill="#1c1815"/>
    <circle cx="50.6" cy="22.4" r="0.8" fill="#fff"/>
  `,

  // 2. 微笑守宮
  house_gecko: `
    <path d="M24 37 L15 32 M22 44 L14 48 M40 37 L49 32 M42 44 L50 48" fill="none" stroke="#ecc79f" stroke-width="3.8" stroke-linecap="round"/>
    <circle cx="14" cy="31" r="2.6" fill="#d4a072"/>
    <circle cx="13" cy="49" r="2.6" fill="#d4a072"/>
    <circle cx="50" cy="31" r="2.6" fill="#d4a072"/>
    <circle cx="51" cy="49" r="2.6" fill="#d4a072"/>
    <path d="M32 45 C32 54, 41 59, 46 54 C48 51, 41 49, 36 45 Z" fill="#f2d0a9" ${S}/>
    <ellipse cx="32" cy="37" rx="10" ry="12" fill="#f6d8b8" ${S}/>
    <ellipse cx="32" cy="21" rx="11.5" ry="9.5" fill="#f6d8b8" ${S}/>
    <circle cx="26.5" cy="19.5" r="3" fill="#231c18"/>
    <circle cx="37.5" cy="19.5" r="3" fill="#231c18"/>
    <circle cx="27.3" cy="18.6" r="1.1" fill="#fff"/>
    <circle cx="38.3" cy="18.6" r="1.1" fill="#fff"/>
    <circle cx="23.5" cy="23.5" r="2.1" fill="#f4979c" opacity="0.7"/>
    <circle cx="40.5" cy="23.5" r="2.1" fill="#f4979c" opacity="0.7"/>
    <path d="M27.5 24.5 Q32 28 36.5 24.5" fill="none" stroke="#5e3d28" stroke-width="1.8" stroke-linecap="round"/>
  `,

  // 3. 藍尾石龍子
  grass_skink: `
    <path d="M28 39 C16 44, 11 54, 21 57 C30 59, 44 52, 54 54" fill="none" stroke="#00b4ff" stroke-width="5.6" stroke-linecap="round"/>
    <path d="M28 39 C16 44, 11 54, 21 57 C30 59, 44 52, 54 54" fill="none" stroke="#7ce3ff" stroke-width="2" stroke-linecap="round"/>
    <path d="M30 39 L24 47 M39 32 L47 38 M29 31 L22 28 M39 21 L35 14" fill="none" stroke="#363d2d" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M25 40 C30 31, 39 22, 47 16 C51 14, 56 15, 53 20 C48 28, 39 36, 31 42 Z" fill="#464f3b" ${S}/>
    <path d="M29 38 C35 31, 43 23, 49 18" fill="none" stroke="#f2e394" stroke-width="2.1" stroke-linecap="round"/>
    <path d="M26 35 C32 28, 40 20, 46 16" fill="none" stroke="#f2e394" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="49.5" cy="18" r="2.1" fill="#141414"/>
    <circle cx="50.2" cy="17.3" r="0.75" fill="#ffffff"/>
  `,

  // 4. 櫻池澤龜
  red_eared_turtle: `
    <path d="M20 44 L16 53 M37 44 L42 53" fill="none" stroke="#4f8233" stroke-width="5.2" stroke-linecap="round"/>
    <path d="M40 36 C46 33, 50 28, 54 29 C58 30, 58 36, 53 38 C48 40, 44 41, 39 42 Z" fill="#598f3a" ${S}/>
    <path d="M48 34 L53 33" stroke="#e63946" stroke-width="2.8" stroke-linecap="round"/>
    <circle cx="53.5" cy="31.5" r="1.8" fill="#181614"/>
    <path d="M12 43 C11 26, 23 19, 32 19 C42 19, 47 28, 45 43 Z" fill="#436b2a" ${S}/>
    <path d="M10 43 L47 43" stroke="#9ec45e" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M22 25 L20 38 M34 25 L36 38 M20 32 L36 32" fill="none" stroke="#2c4a1a" stroke-width="1.6"/>
    <path d="M12 41 L7 43" stroke="#598f3a" stroke-width="2.6" stroke-linecap="round"/>
  `,

  // 5. 綠鬣蜥
  green_iguana: `
    <path d="M23 41 C13 45, 8 53, 18 55 C28 57, 42 53, 54 56" fill="none" stroke="#43a047" stroke-width="5" stroke-linecap="round"/>
    <path d="M13 51 L15 54 M24 55 L26 57 M36 54 L38 56 M46 54 L48 56" stroke="#1e3d21" stroke-width="2.8" stroke-linecap="round"/>
    <polygon points="39,22 41,14 43,22 45,16 47,23 36,24 34,17 32,26 29,20 27,29 24,25 22,33" fill="#9be54a" ${S_THIN}/>
    <path d="M43 32 C41 40, 49 42, 51 34 Z" fill="#8bc34a" ${S_THIN}/>
    <path d="M22 40 C27 30, 36 24, 46 22 C52 21, 56 24, 55 29 C53 33, 47 34, 42 35 C37 40, 30 43, 22 42 Z" fill="#4caf50" ${S}/>
    <path d="M30 40 L27 50 M41 36 L44 47" fill="none" stroke="#388e3c" stroke-width="4.2" stroke-linecap="round"/>
    <circle cx="48" cy="29.5" r="2.8" fill="#a8eb5e" ${S_THIN}/>
    <circle cx="50.5" cy="25" r="2" fill="#181614"/>
  `,

  // 6. 鬃獅蜥
  bearded_dragon: `
    <path d="M20 35 L11 31 M18 44 L10 49 M44 35 L53 31 M46 44 L54 49" fill="none" stroke="#d48c45" stroke-width="4" stroke-linecap="round"/>
    <path d="M32 48 L32 60" stroke="#d48c45" stroke-width="6" stroke-linecap="round"/>
    <path d="M32 48 L32 60" stroke="#b5622a" stroke-width="2" stroke-dasharray="3 3"/>
    <ellipse cx="32" cy="39" rx="15" ry="12.5" fill="#e09a4e" ${S}/>
    <path d="M21 35 Q32 38 43 35 M20 42 Q32 45 44 42" fill="none" stroke="#b5622a" stroke-width="2.6" stroke-linecap="round"/>
    <polygon points="16,35 12,37 16,40 12,43 17,45" fill="#b5622a"/>
    <polygon points="48,35 52,37 48,40 52,43 47,45" fill="#b5622a"/>
    <polygon points="21,26 17,28 22,31 32,33 42,31 47,28 43,26" fill="#472d1c" ${S_THIN}/>
    <polygon points="32,10 21,26 43,26" fill="#e6a55a" ${S}/>
    <circle cx="27" cy="20" r="2" fill="#1e1612"/>
    <circle cx="37" cy="20" r="2" fill="#1e1612"/>
  `,

  // 7. 豹紋守宮
  leopard_gecko: `
    <path d="M23 36 L14 32 M22 44 L14 49 M41 36 L50 32 M42 44 L50 49" fill="none" stroke="#ffca3a" stroke-width="3.8" stroke-linecap="round"/>
    <path d="M32 45 C32 54, 44 60, 50 53 C53 49, 44 45, 36 44 Z" fill="#fff1cc" ${S}/>
    <circle cx="43" cy="52" r="2.3" fill="#332216"/>
    <circle cx="38" cy="50" r="1.9" fill="#332216"/>
    <circle cx="47" cy="51" r="1.7" fill="#332216"/>
    <ellipse cx="32" cy="37" rx="10.5" ry="12" fill="#ffca3a" ${S}/>
    <ellipse cx="32" cy="20" rx="11" ry="9" fill="#ffca3a" ${S}/>
    <circle cx="27" cy="32" r="2.2" fill="#332216"/>
    <circle cx="36" cy="34" r="2.4" fill="#332216"/>
    <circle cx="30" cy="40" r="2.1" fill="#332216"/>
    <circle cx="37" cy="42" r="1.9" fill="#332216"/>
    <circle cx="29" cy="15" r="1.6" fill="#332216"/>
    <circle cx="35" cy="16" r="1.6" fill="#332216"/>
    <circle cx="26.5" cy="19.5" r="2.5" fill="#1c1510"/>
    <circle cx="37.5" cy="19.5" r="2.5" fill="#1c1510"/>
    <circle cx="27.2" cy="18.8" r="0.9" fill="#fff"/>
    <circle cx="38.2" cy="18.8" r="0.9" fill="#fff"/>
    <path d="M28 24 Q32 26.8 36 24" fill="none" stroke="#593a1e" stroke-width="1.6" stroke-linecap="round"/>
  `,

  // 8. 印度星龜
  star_tortoise: `
    <rect x="17" y="42" width="7" height="11" rx="3" fill="#d6b06b" ${S_THIN}/>
    <rect x="37" y="42" width="7" height="11" rx="3" fill="#d6b06b" ${S_THIN}/>
    <circle cx="51" cy="37" r="6" fill="#d6b06b" ${S}/>
    <circle cx="53" cy="35.5" r="1.7" fill="#1a1510"/>
    <path d="M12 44 C12 22, 20 14, 30 14 C40 14, 47 23, 46 44 Z" fill="#241b13" ${S}/>
    <path d="M29 19 L29 33 M22 25 L36 27 M23 31 L35 21" stroke="#f4d35e" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M19 34 L19 42 M14 38 L24 38 M15 35 L23 41" stroke="#f4d35e" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M39 34 L39 42 M34 38 L44 38 M35 35 L43 41" stroke="#f4d35e" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="29" cy="26" r="2.3" fill="#f4d35e"/>
    <circle cx="19" cy="38" r="1.8" fill="#f4d35e"/>
    <circle cx="39" cy="38" r="1.8" fill="#f4d35e"/>
  `,

  // 9. 高冠變色龍
  veiled_chameleon: `
    <path d="M22 41 C13 42, 10 51, 17 55 C23 58, 28 52, 24 47 C21 44, 17 47, 19 50" fill="none" stroke="#38b000" stroke-width="4.2" stroke-linecap="round"/>
    <path d="M22 41 C13 42, 10 51, 17 55 C23 58, 28 52, 24 47" fill="none" ${S_THIN}/>
    <path d="M29 42 L26 52 M41 40 L44 51" fill="none" stroke="#2d9400" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M20 39 C20 26, 32 21, 44 26 C47 32, 46 41, 35 43 C27 44, 21 43, 20 39 Z" fill="#38b000" ${S}/>
    <path d="M27 27 L27 40 M33 25 L33 41 M39 27 L39 40" stroke="#00bbf9" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 26 L30 39 M36 26 L36 39" stroke="#ffe14d" stroke-width="2" stroke-linecap="round"/>
    <path d="M41 26 L46 10 L51 24 L56 30 L47 36 L41 33 Z" fill="#2c9e64" ${S}/>
    <circle cx="49" cy="27.5" r="3.6" fill="#ffe14d" ${S_THIN}/>
    <circle cx="50" cy="27.5" r="1.5" fill="#181512"/>
  `,

  // 10. 冰晶雪蜥
  crystal_lizard: `
    <circle class="svg-glow" cx="32" cy="34" r="22" fill="#90e0ef" opacity="0.22"/>
    <path d="M24 41 C14 44, 10 51, 17 54" fill="none" stroke="#90e0ef" stroke-width="5" stroke-linecap="round"/>
    <polygon points="10,55 15,49 20,56 14,59" fill="#48cae4" ${S_THIN}/>
    <polygon points="24,30 22,20 29,27" fill="#48cae4" ${S_THIN}/>
    <polygon points="31,26 32,14 37,24" fill="#48cae4" ${S_THIN}/>
    <polygon points="39,23 42,13 45,22" fill="#72efdd" ${S_THIN}/>
    <path d="M30 40 L27 50 M42 36 L45 46" fill="none" stroke="#d8f8ff" stroke-width="4" stroke-linecap="round"/>
    <path d="M22 40 C27 31, 36 24, 46 22 C52 21, 57 25, 54 30 C49 34, 44 35, 39 38 C33 42, 27 43, 22 40 Z" fill="#9be7f5" ${S}/>
    <circle cx="50" cy="25.5" r="2.1" fill="#023e8a"/>
    <circle cx="50.7" cy="24.8" r="0.8" fill="#fff"/>
  `,

  // 11. 翡翠樹蚺
  emerald_tree_boa: `
    <ellipse cx="31" cy="46" rx="20" ry="10.5" fill="#15a34a" ${S}/>
    <path d="M14 49 C22 55, 40 55, 48 49" fill="none" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="31" cy="36" rx="15" ry="8.5" fill="#1bbf59" ${S}/>
    <polygon points="19,43 22,40 25,43 22,46" fill="#ffffff"/>
    <polygon points="37,43 40,40 43,43 40,46" fill="#ffffff"/>
    <polygon points="28,33 31,30 34,33 31,36" fill="#ffffff"/>
    <path d="M35 32 C39 24, 37 19, 43 17" fill="none" stroke="#15a34a" stroke-width="6.5" stroke-linecap="round"/>
    <polygon points="37,16 49,12 53,20 42,24" fill="#1bbf59" ${S}/>
    <circle cx="46.5" cy="16.5" r="2.2" fill="#ffd166" ${S_THIN}/>
    <line x1="46.5" y1="15.2" x2="46.5" y2="17.8" stroke="#181412" stroke-width="1"/>
    <path d="M52 19 L58 20 M56 19.6 L59 17.5 M56 19.6 L59 22" fill="none" stroke="#e63946" stroke-width="1.6" stroke-linecap="round"/>
  `,

  // 12. 遠古巨蜥
  komodo_monitor: `
    <path d="M22 41 C12 44, 7 50, 12 55 C17 58, 25 53, 30 54" fill="none" stroke="#52493e" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M12 52 L14 55 M18 54 L20 56" stroke="#2b251f" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M27 42 L24 53 M41 38 L44 49" fill="none" stroke="#473f35" stroke-width="5.2" stroke-linecap="round"/>
    <path d="M20 40 C24 30, 34 25, 44 25 C48 21, 55 21, 58 26 C58 31, 51 33, 46 33 C42 40, 31 44, 20 42 Z" fill="#63584b" ${S}/>
    <rect x="26" y="29" width="6" height="3.2" rx="1" fill="#8f806e" transform="rotate(-14 26 29)"/>
    <rect x="34" y="26" width="6" height="3.2" rx="1" fill="#8f806e" transform="rotate(-6 34 26)"/>
    <path d="M57 28 L62 29 M60 28.5 L62.5 26.8 M60 28.5 L62.5 30.8" fill="none" stroke="#d95f6e" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="51" cy="25" r="2" fill="#1a1510"/>
  `
};

export function hasCustomCreatureIcon(creatureId) {
  return Boolean(CREATURE_SVG_BODY[creatureId]);
}

/**
 * Renders a species-specific vector icon for insects & reptiles (with silhouette support for locked dex entries),
 * or falls back cleanly to the creature's emoji for fish / unknown IDs.
 */
export function renderCreatureIcon(creature, { size = 40, silhouette = false, inline = false, className = '' } = {}) {
  if (!creature) return '';
  const body = CREATURE_SVG_BODY[creature.id];

  if (!body) {
    const cls = [inline ? 'creature-emoji-inline' : 'card-emoji', silhouette ? 'silhouette' : '', className]
      .filter(Boolean)
      .join(' ');
    return `<span class="${cls}" aria-hidden="true">${creature.icon || '❓'}</span>`;
  }

  const wrapCls = [
    inline ? 'creature-icon-inline' : 'creature-icon-wrap',
    silhouette ? 'silhouette' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return `<span class="${wrapCls}" style="width:${size}px;height:${size}px" aria-hidden="true"><svg class="creature-svg" viewBox="0 0 64 64" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${body}</svg></span>`;
}

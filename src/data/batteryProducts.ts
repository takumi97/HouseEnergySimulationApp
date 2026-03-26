export interface BatteryProduct {
  maker: string;
  model: string;
  capacity: number;
  type: string;
}

export const batteryProducts: BatteryProduct[] = [
  // テスラ
  { maker: 'テスラ', model: 'Powerwall 3', capacity: 13.5, type: 'ハイブリッド' },

  // パナソニック
  { maker: 'パナソニック', model: '創蓄連携システムS+ LJB1256 (屋内)', capacity: 5.6, type: 'ハイブリッド' },
  { maker: 'パナソニック', model: '創蓄連携システムS+ LJPB21 (屋内)', capacity: 3.5, type: 'ハイブリッド' },
  { maker: 'パナソニック', model: '創蓄連携システムS+ LJB2263 (屋側)', capacity: 6.3, type: 'ハイブリッド' },
  { maker: 'パナソニック', model: 'eneplat LJB1367 (屋側)', capacity: 6.7, type: 'ハイブリッド' },
  { maker: 'パナソニック', model: 'eneplat LJPB32 (V2H対応)', capacity: 3.5, type: 'ハイブリッド' },

  // シャープ
  { maker: 'シャープ', model: 'JH-WB1921 (ミドル)', capacity: 6.5, type: 'ハイブリッド' },
  { maker: 'シャープ', model: 'JH-WB2021 (ラージ)', capacity: 9.5, type: 'ハイブリッド' },
  { maker: 'シャープ', model: 'JH-WB1821 (クラウド蓄電)', capacity: 4.2, type: 'ハイブリッド' },
  { maker: 'シャープ', model: 'JH-WB2121 (全負荷)', capacity: 13.0, type: 'ハイブリッド' },

  // オムロン
  { maker: 'オムロン', model: 'KPBP-A-SET-HYB65 (6.5kWh)', capacity: 6.5, type: 'ハイブリッド' },
  { maker: 'オムロン', model: 'KPBP-A-SET-HYB98 (9.8kWh)', capacity: 9.8, type: 'ハイブリッド' },
  { maker: 'オムロン', model: 'KPBP-A-SET-HYB164 (16.4kWh)', capacity: 16.4, type: 'ハイブリッド' },
  { maker: 'オムロン', model: 'KP-BU63-S (屋外6.3kWh)', capacity: 6.3, type: '単機能' },
  { maker: 'オムロン', model: 'KP-BU127-S (屋外12.7kWh)', capacity: 12.7, type: '単機能' },

  // ニチコン
  { maker: 'ニチコン', model: 'ESS-T3S1 (4.9kWh)', capacity: 4.9, type: '単機能' },
  { maker: 'ニチコン', model: 'ESS-T3M1 (7.4kWh)', capacity: 7.4, type: '単機能' },
  { maker: 'ニチコン', model: 'ESS-T3L1 (9.9kWh)', capacity: 9.9, type: '単機能' },
  { maker: 'ニチコン', model: 'ESS-T3X1 (14.9kWh)', capacity: 14.9, type: '単機能' },
  { maker: 'ニチコン', model: 'ESS-H2L1 (12.0kWh ハイブリッド)', capacity: 12.0, type: 'ハイブリッド' },
  { maker: 'ニチコン', model: 'ESS-T6S1 (16.6kWh トライブリッド)', capacity: 16.6, type: 'トライブリッド' },

  // 京セラ
  { maker: '京セラ', model: 'エネレッツァ EGS-LM0500 (5.0kWh)', capacity: 5.0, type: '単機能' },
  { maker: '京セラ', model: 'エネレッツァ EGS-LM1000 (10.0kWh)', capacity: 10.0, type: '単機能' },
  { maker: '京セラ', model: 'エネレッツァ EGS-LM1500 (15.0kWh)', capacity: 15.0, type: '単機能' },

  // 長州産業
  { maker: '長州産業', model: 'スマートPVマルチ 6.5kWh (全負荷)', capacity: 6.5, type: 'ハイブリッド' },
  { maker: '長州産業', model: 'スマートPVマルチ 9.8kWh (全負荷)', capacity: 9.8, type: 'ハイブリッド' },
  { maker: '長州産業', model: 'スマートPVマルチ 16.4kWh (全負荷)', capacity: 16.4, type: 'ハイブリッド' },
  { maker: '長州産業', model: 'スマートPVプラス 7.04kWh', capacity: 7.04, type: 'ハイブリッド' },
  { maker: '長州産業', model: 'スマートPVプラス 14.08kWh', capacity: 14.08, type: 'ハイブリッド' },

  // ダイヤゼブラ電機
  { maker: 'ダイヤゼブラ電機', model: 'EIBS7 EHF-S55MP3B (7.04kWh)', capacity: 7.04, type: 'ハイブリッド' },
  { maker: 'ダイヤゼブラ電機', model: 'EIBS7 14.08kWh (2台連結)', capacity: 14.08, type: 'ハイブリッド' },

  // 住友電工
  { maker: '住友電工', model: 'パワーデポH PDS-1000S (12.8kWh)', capacity: 12.8, type: 'ハイブリッド' },

  // カナディアンソーラー
  { maker: 'カナディアンソーラー', model: 'EP CUBE DC-ESS1060J (6.0kWh)', capacity: 6.0, type: 'ハイブリッド' },
  { maker: 'カナディアンソーラー', model: 'EP CUBE DC-ESS1120J (12.0kWh)', capacity: 12.0, type: 'ハイブリッド' },

  // Qセルズ
  { maker: 'Qセルズ', model: 'Q.HOME CORE H-R33060 (6.0kWh)', capacity: 6.0, type: 'ハイブリッド' },

  // 伊藤忠
  { maker: '伊藤忠 (スマートスター)', model: 'SmartStar 3 (13.16kWh 全負荷)', capacity: 13.16, type: '単機能' },
];

export const batteryMakers = ['その他（手動入力）', ...Array.from(new Set(batteryProducts.map(p => p.maker)))];

export function getModelsByMaker(maker: string): BatteryProduct[] {
  return batteryProducts.filter(p => p.maker === maker);
}

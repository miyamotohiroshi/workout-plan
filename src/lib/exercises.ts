// 種目マスター: メニュー・記録の選択肢・テンプレートはすべてここを参照する。
// name は記録 (exercise_records.exercise_name) のキーなので、既存の種目名は変更しないこと。

export type BodyPart = '胸' | '背中' | '肩' | '腕' | '脚' | '腹筋' | '首' | '全身';
export type Equipment = 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'cable' | 'bodyweight' | 'other';

export interface ExerciseDef {
  id: string;
  name: string;
  part: BodyPart;
  equipment: Equipment;
  icon: string;
  description: string;
  points: string[];
  /** YouTube 検索キーワード (検索結果ページへのリンクにする) */
  youtubeQuery: string;
  /** public/images/exercises/<id>.jpg がある種目 */
  hasImage?: boolean;
  /** 現在のメニュー (Pattern A/B) では使っていない、今後用に用意している種目 */
  reserve?: boolean;
  /** 種目固有の重量アップの目安 (役割ごとの既定値より優先) */
  progression?: string;
}

const defs: ExerciseDef[] = [
  // ── 肩 ─────────────────────────────────────────
  {
    id: 'overhead-press', name: 'バーベル・オーバーヘッドプレス', part: '肩', equipment: 'barbell', icon: '🔱', hasImage: true,
    description: '肩の王道種目。全体の三角筋と上部僧帽筋を最大限に刺激。肩の厚みと丸みを作る最重要メニュー。',
    points: ['グリップは肩幅より少し広め', '体幹をしっかり固めてバーを真上に押す', 'バーが顎を超えたら頭を少し前に出す', '最初の2セットで重量を決める（メインはRPE8程度）'],
    youtubeQuery: 'バーベルオーバーヘッドプレス+やり方',
  },
  {
    id: 'shoulder-press', name: 'ショルダー・プレス', part: '肩', equipment: 'dumbbell', icon: '🔄', hasImage: true,
    description: 'ダンベルを使って三角筋全体を鍛えるプレス種目。バーベルより可動域が広くコントロールしやすいため、フォームを意識しながら追い込みやすい。',
    points: ['ダンベルを耳の高さ・肩幅程度でスタート', '頭の真上に向けてまっすぐ押し上げる', '最高点で肘をロックせず少し曲げたまま', 'ゆっくり（2〜3秒）下ろす'],
    youtubeQuery: 'ダンベルショルダープレス+三角筋+フォーム',
  },
  {
    id: 'side-raise', name: 'ダンベル・サイドレイズ', part: '肩', equipment: 'dumbbell', icon: '↔️', hasImage: true,
    description: '三角筋中部を集中的に鍛える。肩の横の張り出し・服を着たときの肩幅づくりに直結。',
    points: ['肘を少し曲げ、小指側を上に向けて上げる', '肩より高く上げすぎない（僧帽筋を使いすぎない）', 'ゆっくり下ろして筋肉に効かせる', '最終セットはドロップセット（重量を下げて追い込む）'],
    youtubeQuery: 'ダンベルサイドレイズ+コツ',
  },
  {
    id: 'rear-raise', name: 'ダンベル・リアレイズ', part: '肩', equipment: 'dumbbell', icon: '🔙', hasImage: true,
    description: '三角筋後部を鍛え、後ろから見たときの肩の丸みとVシェイプを強調。姿勢改善にも効果的。',
    points: ['上体を前傾（約45〜90度）させて行う', '肘を少し曲げたまま横に広げる', '肩甲骨を寄せすぎず、三角筋後部で引く意識', '軽めの重量でフォームを優先する'],
    youtubeQuery: 'ダンベルリアレイズ+三角筋後部',
  },
  {
    id: 'shrug', name: 'ダンベル・シュラッグ', part: '肩', equipment: 'dumbbell', icon: '⚡', hasImage: true,
    description: 'ダンベルで僧帽筋（首から肩にかけての筋肉）を鍛える種目。首回りのボリュームアップと肩の安定性向上に効果的。左右差の修正にも使いやすい。',
    points: ['ダンベルを体の横に持ち、肩を耳に近づけるように真上に引き上げる', '最高点で2〜3秒キープして僧帽筋を収縮させる', 'ゆっくり下ろしてストレッチをしっかり効かせる', '首を縮めたり回したりしない'],
    youtubeQuery: 'ダンベルシュラッグ+僧帽筋+フォーム',
  },
  {
    id: 'smith-shoulder-press', name: 'スミスマシン・ショルダープレス', part: '肩', equipment: 'machine', icon: '🤖', hasImage: true,
    description: 'スミスマシンで安定した軌道を確保しながら三角筋全体を追い込む。',
    points: ['座って行うと安定感が増す', 'バーを顎の高さまで下げる', '最大収縮で1秒キープ'],
    youtubeQuery: 'スミスマシンショルダープレス+三角筋',
  },
  {
    id: 'machine-side-raise', name: 'マシン・サイドレイズ（またはダンベル）', part: '肩', equipment: 'machine', icon: '↔️', hasImage: true,
    description: '週2回目の三角筋中部刺激。ポンプを意識して軽めでテンポよく。',
    points: ['月曜より軽めの重量で高rep', '肩に血を集めてパンプを感じる'],
    youtubeQuery: 'ダンベルサイドレイズ+コツ',
  },
  {
    id: 'face-pull', name: 'フェイスプル', part: '肩', equipment: 'cable', icon: '🎯', hasImage: true, reserve: true,
    description: 'ロープで顔に向かって引き、三角筋後部と肩まわりの細かい筋肉を鍛える。肩のケガ予防と姿勢改善に。',
    points: ['ケーブルは目の高さにセット', '肘を高く保ったまま、ロープを顔の両側へ引き分ける', '引いたところで1秒止め、肩甲骨を寄せる'],
    youtubeQuery: 'フェイスプル+やり方',
  },
  {
    id: 'cable-side-raise', name: 'ケーブル・サイドレイズ', part: '肩', equipment: 'cable', icon: '↗️', hasImage: true, reserve: true,
    description: 'ケーブルで動作の最初から最後まで負荷が抜けないサイドレイズ。片側ずつ丁寧に効かせられる。',
    points: ['ケーブルを低い位置にセットし、体の前を通して持つ', '肘を少し曲げたまま肩の高さまで上げる', '下ろすときもゆっくり負荷を感じる'],
    youtubeQuery: 'ケーブルサイドレイズ+やり方',
  },
  {
    id: 'arnold-press', name: 'アーノルドプレス', part: '肩', equipment: 'dumbbell', icon: '🌀', reserve: true,
    description: '手のひらを回しながら押し上げるダンベルプレス。三角筋の前部と中部をまとめて鍛える。',
    points: ['手のひらを自分に向けてスタート', '押し上げながら手のひらを前に向ける', '反動を使わずゆっくり行う'],
    youtubeQuery: 'アーノルドプレス+やり方',
  },
  {
    id: 'reverse-pec-deck', name: 'リアデルト・マシン', part: '肩', equipment: 'machine', icon: '🔙', reserve: true,
    description: 'ペックデックを逆向きに使い、三角筋後部を安定して鍛える。',
    points: ['胸をパッドにつけ、腕を横に開く', '肩甲骨を寄せすぎず、肩の後ろで開く意識'],
    youtubeQuery: 'リアデルトマシン+やり方',
  },

  // ── 胸 ─────────────────────────────────────────
  {
    id: 'bench-press', name: 'バーベル・ベンチプレス', part: '胸', equipment: 'barbell', icon: '💥', hasImage: true,
    description: '胸板の厚みを作る最基本種目。大胸筋・三角筋前部・上腕三頭筋を総動員。',
    points: ['グリップは肩幅の1.5倍程度', '肩甲骨を寄せてアーチを作り、肩を守る', 'バーを乳首あたりに下ろす', '肘を45度（体との角度）で下ろす'],
    youtubeQuery: 'バーベルベンチプレス+正しいフォーム',
  },
  {
    id: 'incline-press', name: 'ダンベル・インクラインプレス', part: '胸', equipment: 'dumbbell', icon: '📈', hasImage: true,
    description: '大胸筋上部を鍛え、胸板の上部の厚みと服を着たときのシルエットを作る。',
    points: ['ベンチ角度は30〜45度', 'ダンベルを鎖骨〜乳首の上あたりに下ろす', '押すときに内側に絞るイメージ'],
    youtubeQuery: 'インクラインダンベルプレス+大胸筋上部',
  },
  {
    id: 'dumbbell-fly', name: 'ダンベル・フライ', part: '胸', equipment: 'dumbbell', icon: '🦋', hasImage: true,
    description: '大胸筋を最大ストレッチさせる種目。胸の内側の輪郭と伸展域での筋肥大に効果的。',
    points: ['肘を少し曲げた状態を保ったまま弧を描く', '下げすぎて肩が痛い場合は浅めに', '胸の上で絞るように閉じる'],
    youtubeQuery: 'ダンベルフライ+大胸筋+コツ',
  },
  {
    id: 'push-up', name: '腕立て伏せ', part: '胸', equipment: 'bodyweight', icon: '🙌', hasImage: true, reserve: true,
    description: '器具なしでできる胸の基本種目。初心者の入門や自宅トレーニング、仕上げのパンプに。',
    points: ['手幅は肩幅より少し広め', '頭からかかとまで一直線を保つ', '胸が床に近づくまで下ろす', 'きつい場合は膝をついて行う'],
    youtubeQuery: '腕立て伏せ+正しいやり方',
    progression: '全セットで20回できたら、足を台に乗せるか背中に重りを乗せる',
  },
  {
    id: 'chest-press', name: 'チェストプレス（マシン）', part: '胸', equipment: 'machine', icon: '🤖', hasImage: true, reserve: true,
    description: 'マシンで軌道が安定しているため、初心者でも安全に胸を追い込める。',
    points: ['グリップが胸の中央の高さに来るようにシートを調整', '肩甲骨を寄せたまま押す', '戻すときもゆっくり'],
    youtubeQuery: 'チェストプレス+マシン+やり方',
  },
  {
    id: 'pec-deck', name: 'ペックデック', part: '胸', equipment: 'machine', icon: '🦋', reserve: true,
    description: 'マシンで胸を寄せる動きを安定して行える。胸の内側の仕上げに。',
    points: ['肘を少し曲げたまま腕を閉じる', '閉じたところで1秒止める'],
    youtubeQuery: 'ペックデック+やり方',
  },
  {
    id: 'cable-crossover', name: 'ケーブル・クロスオーバー', part: '胸', equipment: 'cable', icon: '✖️', reserve: true,
    description: 'ケーブルで胸を寄せる種目。角度を変えて胸の上部・下部を狙える。',
    points: ['上体を少し前傾させる', '弧を描くように手を体の前で合わせる'],
    youtubeQuery: 'ケーブルクロスオーバー+やり方',
  },
  {
    id: 'incline-bench-press', name: 'インクライン・ベンチプレス', part: '胸', equipment: 'barbell', icon: '📈', reserve: true,
    description: 'バーベルで大胸筋上部に高重量をかける。',
    points: ['ベンチ角度は30度前後', 'バーを鎖骨の少し下に下ろす'],
    youtubeQuery: 'インクラインベンチプレス+フォーム',
  },

  // ── 背中 ───────────────────────────────────────
  {
    id: 'deadlift', name: 'デッドリフト', part: '背中', equipment: 'barbell', icon: '⚓', hasImage: true,
    description: '全身の筋肉を動員する最強の種目。背中の厚みとVシェイプ、全体的な筋肉量増加の核心。',
    points: ['バーはすねの前（ほぼ密着）、足幅は腰幅', '背中をフラットに保ち、腹圧を高めてから引く', 'ロックアウトで腰を過度に反らない', '重量より完璧なフォームを優先する'],
    youtubeQuery: 'デッドリフト+フォーム+初心者',
  },
  {
    id: 'pull-up', name: '懸垂', part: '背中', equipment: 'bodyweight', icon: '🧗', hasImage: true,
    description: '自分の体重で広背筋を鍛える、背中の広がり（逆三角形）を作る王道種目。ラグビーで相手をつかんで引く力にも直結。',
    points: ['手幅は肩幅の1.5倍程度、順手で握る', '胸をバーに近づけるイメージで、肩甲骨を下げながら引く', '反動を使わず、下ろすときも2秒かける', '5回未満ならラットプルダウンや補助付きで回数を確保する'],
    youtubeQuery: '懸垂+正しいやり方+広背筋',
    progression: '全セットで10回できたら、ディップベルトやダンベルで加重する',
  },
  {
    id: 'barbell-row', name: 'バーベル・ベントオーバーロウ', part: '背中', equipment: 'barbell', icon: '📐', hasImage: true,
    description: '背中全体（広背筋・僧帽筋・菱形筋）に高重量をかけられる。背中の厚みと幅を同時に作る。',
    points: ['上体は45〜60度に前傾。背中はフラット', 'バーをへそに向けて引く（広背筋意識）', '肘を背中に近い軌道で引く'],
    youtubeQuery: 'バーベルベントオーバーロウ+コツ',
  },
  {
    id: 'one-arm-row', name: 'ダンベル・ワンハンドロウ', part: '背中', equipment: 'dumbbell', icon: '💪', hasImage: true,
    description: '片側ずつ行うことで左右差を修正し、広背筋への収縮を感じやすい。',
    points: ['ベンチに膝と手をついて体を安定', 'ダンベルを腰骨に向けて引く', '引いたところで1秒止める'],
    youtubeQuery: 'ダンベルロウ+広背筋+コツ',
  },
  {
    id: 'lat-pulldown', name: 'ラットプルダウン', part: '背中', equipment: 'machine', icon: '🏄', hasImage: true,
    description: '広背筋の幅を作るVシェイプの主役種目。懸垂の回数がまだ少ないときの代わりにも使える。',
    points: ['広めグリップ（肩幅の1.5倍程度）', '胸を張り、バーを鎖骨〜胸の上部に引く', '肩甲骨を下げながら引くイメージ'],
    youtubeQuery: 'ラットプルダウン+広背筋+フォーム',
  },
  {
    id: 'good-morning', name: 'バーベル・グッドモーニング', part: '背中', equipment: 'barbell', icon: '🎯', hasImage: true, reserve: true,
    description: '脊柱起立筋・ハムストリングスを鍛え、デッドリフトのサポート筋を強化。デッドリフトと同じ日に行うと腰の負担が大きいので注意。',
    points: ['バーを僧帽筋上に担ぐ（軽めで行う）', '背中まっすぐのまま股関節から前傾', 'ハムストリングスのストレッチを感じる深さまで'],
    youtubeQuery: 'バーベルグッドモーニング+脊柱起立筋',
  },
  {
    id: 'cable-row', name: 'シーテッド・ケーブルロウ', part: '背中', equipment: 'cable', icon: '🚣', hasImage: true, reserve: true,
    description: '座ってケーブルを引き、背中の中央（僧帽筋中部・菱形筋）と広背筋の厚みを作る。腰への負担が少ない。',
    points: ['胸を張って背すじを伸ばしたまま引く', 'ハンドルをみぞおち〜へそに向けて引く', '戻すときに肩甲骨を前に開いてストレッチ'],
    youtubeQuery: 'シーテッドロウ+やり方',
  },
  {
    id: 't-bar-row', name: 'Tバーロウ', part: '背中', equipment: 'barbell', icon: '📐', reserve: true,
    description: 'バーの片側を固定して引く種目。背中の厚みに高重量をかけやすい。',
    points: ['上体を45度程度に前傾', '胸に向かって引き、肩甲骨を寄せる'],
    youtubeQuery: 'Tバーロウ+やり方',
  },
  {
    id: 'machine-row', name: 'マシンロウ', part: '背中', equipment: 'machine', icon: '🤖', reserve: true,
    description: 'マシンで軌道が安定したロウ。初心者でも背中に効かせやすい。',
    points: ['胸をパッドにつけて体を固定', '肘を後ろに引き、肩甲骨を寄せる'],
    youtubeQuery: 'マシンロウ+やり方',
  },
  {
    id: 'inverted-row', name: 'インバーテッドロウ', part: '背中', equipment: 'bodyweight', icon: '🤸', reserve: true,
    description: '低いバーにぶら下がって体を引き寄せる自重のロウ。懸垂ができない人の入門にも。',
    points: ['体を一直線に保つ', '胸をバーに近づける'],
    youtubeQuery: 'インバーテッドロウ+やり方',
  },

  // ── 腕 ─────────────────────────────────────────
  {
    id: 'barbell-curl', name: 'バーベル・カール', part: '腕', equipment: 'barbell', icon: '🌀', hasImage: true,
    description: '上腕二頭筋を直接鍛え、腕の太さを作る。背中デーの仕上げに。',
    points: ['肘を固定し、体の揺れを使わない', '最高点で1秒キープ', 'ゆっくり（3秒）下ろす'],
    youtubeQuery: 'バーベルカール+上腕二頭筋+フォーム',
  },
  {
    id: 'dips', name: 'ディップス（自重）', part: '腕', equipment: 'bodyweight', icon: '🤸', hasImage: true, reserve: true,
    description: '大胸筋下部と三頭筋を仕上げる締め種目。ディップスバー（平行棒）が必要。',
    points: ['前傾すると胸、垂直だと三頭筋に入る', '肘が外に開きすぎないよう注意', 'できるなら加重（ダンベルを足で挟む）'],
    youtubeQuery: 'ディップス+大胸筋+フォーム',
    progression: '全セットで12回以上できたら、ダンベルを足で挟むかベルトで加重する',
  },
  {
    id: 'skull-crusher', name: 'スカルクラッシャー', part: '腕', equipment: 'barbell', icon: '💀', hasImage: true,
    description: 'ベンチに寝てバーを額に向かって下ろし、上腕三頭筋を集中的に鍛える。腕の太さの3分の2は三頭筋。',
    points: ['EZバーかバーベルを肩幅より狭めに握る', '肘の位置を固定し、肘から先だけを動かす', 'バーを額〜頭の上に向かってゆっくり下ろす', '肘が痛む場合は重量を下げるかダンベルで行う'],
    youtubeQuery: 'スカルクラッシャー+やり方',
  },
  {
    id: 'triceps-pushdown', name: 'トライセプス・プレスダウン', part: '腕', equipment: 'cable', icon: '⬇️', hasImage: true,
    description: 'ケーブルで上腕三頭筋を安全に追い込める定番種目。肘への負担が少なく高回数で効かせやすい。',
    points: ['肘を体の横に固定する', 'バー（ロープ）を太ももまで押し下げて伸ばしきる', '戻すときに肘が前に出ないようにする'],
    youtubeQuery: 'トライセプスプレスダウン+やり方',
  },
  {
    id: 'hammer-curl', name: 'ダンベル・ハンマーカール', part: '腕', equipment: 'dumbbell', icon: '🔨', hasImage: true, reserve: true,
    description: '縦向きにダンベルを持つカール。二頭筋に加えて前腕と腕の外側（上腕筋）を太くする。',
    points: ['親指を上に向けたまま持ち上げる', '肘を体の横に固定する', '反動を使わずゆっくり下ろす'],
    youtubeQuery: 'ハンマーカール+やり方',
  },
  {
    id: 'overhead-triceps-extension', name: 'オーバーヘッド・トライセプスエクステンション', part: '腕', equipment: 'dumbbell', icon: '⤴️', hasImage: true,
    description: 'ダンベル1つを頭の上から後ろへ下ろし、上腕三頭筋（特に腕の裏の太さを作る長頭）をストレッチさせて鍛える。ダンベルだけでできる。',
    points: ['ベンチに座り、ダンベルの片側を両手で包むように持つ', '肘を耳の横で固定し、頭の後ろへゆっくり下ろす', '肘を開かずに真上へ伸ばしきる', '腰を反らさないよう背もたれのあるベンチで行うと安定する'],
    youtubeQuery: 'オーバーヘッドエクステンション+やり方',
  },
  {
    id: 'preacher-curl', name: 'プリーチャーカール', part: '腕', equipment: 'machine', icon: '🌀', reserve: true,
    description: '台に腕を乗せて反動を使えない状態で二頭筋を鍛える。',
    points: ['脇を台にしっかりつける', '下ろしきる手前で止める'],
    youtubeQuery: 'プリーチャーカール+やり方',
  },
  {
    id: 'close-grip-bench', name: 'ナローベンチプレス', part: '腕', equipment: 'barbell', icon: '💥', hasImage: true,
    description: '手幅を狭くしたベンチプレス。上腕三頭筋と大胸筋の内側に高重量をかけられる。ベンチとバーベルだけでできる三頭筋の仕上げ種目。',
    points: ['手幅は肩幅程度（狭すぎると手首を痛める）', '肘を体に近づけたまま、みぞおちの少し上に下ろす', '押し上げるときに三頭筋で伸ばしきる', 'ベンチプレスより2〜3割軽い重量から始める'],
    youtubeQuery: 'ナローベンチプレス+やり方',
  },

  // ── 脚 ─────────────────────────────────────────
  {
    id: 'barbell-squat', name: 'バーベル・スクワット', part: '脚', equipment: 'barbell', icon: '👑', hasImage: true,
    description: '脚の王様種目。大腿四頭筋・大臀筋・ハムストリングスを全部動員。全身の成長ホルモン分泌も促進。',
    points: ['バーは僧帽筋上（ハイバー）に担ぐ', '足幅は肩幅程度、つま先は30度外向き', '太ももが床と平行になるまで下げる'],
    youtubeQuery: 'バーベルスクワット+正しいフォーム+初心者',
  },
  {
    id: 'smith-squat', name: 'スミスマシン・スクワット', part: '脚', equipment: 'machine', icon: '🏔️', hasImage: true,
    description: 'マシンで安定した軌道を確保しながら大腿四頭筋・大臀筋を重点的に鍛える。',
    points: ['足の位置はやや前方（バーの真下より少し前）', '膝がつま先より内側に入らないよう注意', '太ももが床と平行になるまで下げる'],
    youtubeQuery: 'スミスマシンスクワット+フォーム',
  },
  {
    id: 'hip-thrust', name: 'バーベル・ヒップスラスト', part: '脚', equipment: 'barbell', icon: '🍑', hasImage: true,
    description: '大臀筋を最大収縮させる最強の種目。お尻の丸みと張りを作り、ラグビー選手的な下半身を構築。',
    points: ['肩甲骨をベンチの端に固定', '腰を上げたところでお尻を2秒キュッと締める', '腰を反らせすぎず骨盤を水平に'],
    youtubeQuery: 'バーベルヒップスラスト+大臀筋+フォーム',
  },
  {
    id: 'lunge', name: 'ダンベル・ランジ', part: '脚', equipment: 'dumbbell', icon: '🚶', hasImage: true,
    description: '左右の脚を均等に鍛えつつ、バランス能力も向上させる。',
    points: ['踏み込んだ膝が90度になる歩幅', '前膝がつま先より前に出ない'],
    youtubeQuery: 'ダンベルランジ+フォーム+コツ',
  },
  {
    id: 'romanian-deadlift', name: 'ルーマニアン・デッドリフト', part: '脚', equipment: 'barbell', icon: '📉', hasImage: true,
    description: 'ハムストリングスをストレッチしながら鍛える。太ももの裏の厚みとお尻の境目を作る。',
    points: ['膝は軽く曲げた状態を固定', 'ハムの引っ張りを感じる深さまで前傾', 'ダンベルでも同じ動きでできる'],
    youtubeQuery: 'ルーマニアンデッドリフト+ハムストリングス',
  },
  {
    id: 'leg-press', name: 'レッグプレス', part: '脚', equipment: 'machine', icon: '🦿', hasImage: true,
    description: '腰への負担を減らしながら大腿四頭筋・大臀筋・ハムストリングスに高重量をかけられる。',
    points: ['足幅はやや広め、つま先は30度外向き', '膝がプラットフォームに当たりすぎない深さまで曲げる', '腰をシートから浮かさない'],
    youtubeQuery: 'レッグプレス+やり方+コツ',
  },
  {
    id: 'leg-curl', name: 'レッグカール', part: '脚', equipment: 'machine', icon: '🔩', hasImage: true,
    description: 'ハムストリングスを単独で鍛えられる貴重な種目。太ももの裏の厚みを作る。',
    points: ['骨盤を浮かさずに曲げる', '最大収縮でキープ（1〜2秒）', 'ゆっくり（3秒）伸ばして戻す'],
    youtubeQuery: 'レッグカール+フォーム',
  },
  {
    id: 'leg-extension', name: 'レッグエクステンション', part: '脚', equipment: 'machine', icon: '🦵', hasImage: true,
    description: '大腿四頭筋を最大収縮まで追い込む仕上げ種目。',
    points: ['つま先をやや外向きにすると外側広筋に入りやすい', '最高点で1〜2秒キープ'],
    youtubeQuery: 'レッグエクステンション+コツ',
  },
  {
    id: 'calf-raise-machine', name: 'カーフレイズ（マシン）', part: '脚', equipment: 'machine', icon: '⬆️', hasImage: true,
    description: 'ふくらはぎを鍛えて脚全体のシルエットを完成させる。',
    points: ['踵が完全に下がりきる深さまでストレッチ', '最高点で2秒キープ'],
    youtubeQuery: 'カーフレイズ+やり方',
  },
  {
    id: 'calf-raise-barbell', name: 'カーフレイズ（バーベル）', part: '脚', equipment: 'barbell', icon: '⬆️', hasImage: true,
    description: 'ふくらはぎを鍛えて脚全体のシルエットを完成させる締め種目。',
    points: ['踵が完全に下がりきるまでストレッチ', '最高点で2秒キープ'],
    youtubeQuery: 'カーフレイズ+バーベル+ふくらはぎ',
  },
  {
    id: 'goblet-squat', name: 'ゴブレット・スクワット', part: '脚', equipment: 'dumbbell', icon: '🏆', hasImage: true, reserve: true,
    description: 'ダンベル1つを胸の前で抱えて行うスクワット。フォームを覚えやすく、初心者や自宅トレーニングに最適。',
    points: ['ダンベルを胸の前で縦に抱える', '胸を張ったまま、肘が膝の内側に来るまでしゃがむ', 'かかと全体で床を押して立ち上がる'],
    youtubeQuery: 'ゴブレットスクワット+やり方',
  },
  {
    id: 'bulgarian-split-squat', name: 'ブルガリアン・スクワット', part: '脚', equipment: 'dumbbell', icon: '🦩', hasImage: true, reserve: true,
    description: '後ろ足をベンチに乗せる片脚スクワット。お尻と太ももを強く刺激し、左右差の修正にも。',
    points: ['後ろ足の甲をベンチに乗せる', '前足に体重をかけ、後ろの膝を床に近づける', '上体はやや前傾でお尻に効かせる'],
    youtubeQuery: 'ブルガリアンスクワット+やり方',
  },
  {
    id: 'hack-squat', name: 'ハックスクワット', part: '脚', equipment: 'machine', icon: '🏔️', reserve: true,
    description: '背中をパッドに預けて行うマシンスクワット。大腿四頭筋を安全に追い込める。',
    points: ['足はプラットフォームの中央に', '深くしゃがんでも腰を浮かさない'],
    youtubeQuery: 'ハックスクワット+やり方',
  },
  {
    id: 'front-squat', name: 'フロントスクワット', part: '脚', equipment: 'barbell', icon: '👑', reserve: true,
    description: 'バーを体の前に担ぐスクワット。上体が立ちやすく、太ももの前と体幹を強く使う。',
    points: ['肘を高く上げてバーを肩の前に乗せる', '上体を立てたまましゃがむ'],
    youtubeQuery: 'フロントスクワット+やり方',
  },
  {
    id: 'hip-abduction', name: 'ヒップアブダクション', part: '脚', equipment: 'machine', icon: '↔️', reserve: true,
    description: '脚を外に開くマシン。お尻の横（中臀筋）を鍛え、膝の安定にも役立つ。',
    points: ['上体を少し前傾させるとお尻に入りやすい', '開いたところで1秒止める'],
    youtubeQuery: 'ヒップアブダクション+やり方',
  },
  {
    id: 'hip-adduction', name: 'ヒップアダクション', part: '脚', equipment: 'machine', icon: '↕️', reserve: true,
    description: '脚を内側に閉じるマシン。内ももを鍛える。',
    points: ['ゆっくり閉じて、ゆっくり開く'],
    youtubeQuery: 'ヒップアダクション+やり方',
  },
  {
    id: 'seated-calf-raise', name: 'シーテッド・カーフレイズ', part: '脚', equipment: 'machine', icon: '⬆️', reserve: true,
    description: '座って行うカーフレイズ。ふくらはぎの奥のヒラメ筋を狙う。',
    points: ['踵を深く下げてストレッチ', '最高点で2秒キープ'],
    youtubeQuery: 'シーテッドカーフレイズ+やり方',
  },
  {
    id: 'step-up', name: 'ステップアップ', part: '脚', equipment: 'dumbbell', icon: '🪜', reserve: true,
    description: '台に片脚で上る種目。お尻と太ももを鍛え、走る・踏み込む動きにつながる。',
    points: ['膝が90度くらいになる高さの台を使う', '前の脚の力だけで上る'],
    youtubeQuery: 'ステップアップ+筋トレ',
  },
  {
    id: 'glute-bridge', name: 'グルートブリッジ', part: '脚', equipment: 'bodyweight', icon: '🌉', reserve: true,
    description: '床に寝てお尻を持ち上げる。ヒップスラストの入門・自宅版。',
    points: ['かかとで床を押す', '上で2秒お尻を締める'],
    youtubeQuery: 'グルートブリッジ+やり方',
  },

  // ── 腹筋 ───────────────────────────────────────
  {
    id: 'hanging-leg-raise', name: 'ハンギング・レッグレイズ', part: '腹筋', equipment: 'bodyweight', icon: '🪝', hasImage: true,
    description: 'バーにぶら下がって脚を持ち上げ、腹筋の下部を強烈に鍛える。懸垂と同じバーでできる。',
    points: ['体を振らずに、骨盤を丸めるように脚を上げる', '膝を曲げると簡単、伸ばすと難しくなる', 'ゆっくり下ろして反動を使わない'],
    youtubeQuery: 'ハンギングレッグレイズ+やり方',
  },
  {
    id: 'leg-raise', name: 'レッグレイズ', part: '腹筋', equipment: 'bodyweight', icon: '🦵', hasImage: true,
    description: '床に寝て脚を上げ下げし、腹筋の下部を鍛える。器具がなくてもできる。',
    points: ['腰が床から浮かないよう、お腹に力を入れ続ける', '脚は床すれすれまでゆっくり下ろす', '手はお尻の横か下に置いて支える'],
    youtubeQuery: 'レッグレイズ+正しいやり方',
  },
  {
    id: 'plank', name: 'プランク', part: '腹筋', equipment: 'bodyweight', icon: '🧱', hasImage: true,
    description: '体を一直線に保つ体幹の基本種目。タックルやスクラムで当たり負けしない胴体を作る。',
    points: ['肘は肩の真下につく', '頭からかかとまで一直線（お尻を上げない・下げない）', 'お腹とお尻に力を入れて呼吸は止めない'],
    youtubeQuery: 'プランク+正しいやり方',
  },
  {
    id: 'ab-roller', name: 'アブローラー', part: '腹筋', equipment: 'other', icon: '🛞', hasImage: true,
    description: 'ローラーを転がして腹筋全体に強い負荷をかける。腰を反らさずに耐える力も鍛えられる。',
    points: ['膝をついた姿勢から始める', '腰が反らない範囲まで前に転がす', 'お腹で引き戻すイメージで戻る'],
    youtubeQuery: 'アブローラー+正しいやり方',
  },
  {
    id: 'side-plank', name: 'サイドプランク', part: '腹筋', equipment: 'bodyweight', icon: '📏', hasImage: true, reserve: true,
    description: '横向きで体を支え、脇腹（腹斜筋）を鍛える。体をひねる・踏ん張る動きの土台に。',
    points: ['肘を肩の真下につく', '頭から足まで一直線を保つ', '左右同じ時間行う'],
    youtubeQuery: 'サイドプランク+やり方',
  },
  {
    id: 'cable-crunch', name: 'ケーブルクランチ', part: '腹筋', equipment: 'cable', icon: '🙇', reserve: true,
    description: 'ケーブルで重さをかけて腹筋を丸める。重量で負荷を調整できる。',
    points: ['膝立ちでロープを頭の横に持つ', 'みぞおちを丸めるように下を向く'],
    youtubeQuery: 'ケーブルクランチ+やり方',
  },
  {
    id: 'pallof-press', name: 'パロフプレス', part: '腹筋', equipment: 'cable', icon: '🧲', reserve: true,
    description: '横から引っ張られるケーブルに耐えて体をまっすぐ保つ。ひねりに強い体幹を作る。',
    points: ['ケーブルの横に立ち、胸の前から腕を伸ばす', '体がケーブル側に回らないよう耐える'],
    youtubeQuery: 'パロフプレス+やり方',
  },
  {
    id: 'dead-bug', name: 'デッドバグ', part: '腹筋', equipment: 'bodyweight', icon: '🐞', reserve: true,
    description: '仰向けで手足を交互に伸ばす体幹種目。腰を痛めにくく初心者向け。',
    points: ['腰を床に押しつけたまま行う', '対角の手と足をゆっくり伸ばす'],
    youtubeQuery: 'デッドバグ+体幹',
  },

  // ── 首 ─────────────────────────────────────────
  {
    id: 'neck', name: 'ネックトレーニング（前・後ろ）', part: '首', equipment: 'other', icon: '🦒', hasImage: true,
    description: '首の前と後ろを鍛える。ラグビー選手らしい太い首を作り、コンタクトでのケガ予防にもなる。',
    points: ['ベンチにあおむけ（前）・うつぶせ（後ろ）になり、頭をベンチから出す', '額や後頭部にタオルを当て、軽いプレートを手で押さえる', '首だけをゆっくり上げ下げする（反動は絶対に使わない）', 'まずは自重やタオルの抵抗から始め、痛みがあれば中止'],
    youtubeQuery: '首+筋トレ+ネックフレクション',
    progression: '前後それぞれ20回できたら、プレートを1段階重くする',
  },
  {
    id: 'neck-harness', name: 'ネックハーネス', part: '首', equipment: 'other', icon: '🪖', reserve: true,
    description: '頭にハーネスをつけて重りを吊るし、首の後ろを鍛える。',
    points: ['軽い重量から始める', 'ゆっくり上げ下げし、反動を使わない'],
    youtubeQuery: 'ネックハーネス+トレーニング',
  },

  // ── 全身・瞬発力 ───────────────────────────────
  {
    id: 'farmers-walk', name: 'ファーマーズウォーク', part: '全身', equipment: 'dumbbell', icon: '🧳', hasImage: true, reserve: true,
    description: '重いダンベルを両手に持って歩く。握力・僧帽筋・体幹をまとめて鍛え、当たりに強い体を作る。',
    points: ['背すじを伸ばし、肩をすくめずに持つ', '小さめの歩幅でまっすぐ歩く', '20〜30m、または30〜40秒を目安に'],
    youtubeQuery: 'ファーマーズウォーク+やり方',
    progression: '決めた距離を楽に歩けたら、ダンベルを1段階重くする',
  },
  {
    id: 'kettlebell-swing', name: 'ケトルベル・スイング', part: '全身', equipment: 'kettlebell', icon: '🔔', hasImage: true, reserve: true,
    description: 'お尻の力でケトルベルを振り上げる。股関節を爆発的に伸ばす力（ダッシュ・タックル）と心肺機能を高める。',
    points: ['腕ではなく、お尻を前に突き出す力で振る', '背中を丸めず、股関節から折りたたむ', 'ケトルベルは胸の高さまで'],
    youtubeQuery: 'ケトルベルスイング+やり方',
  },
  {
    id: 'power-clean', name: 'パワークリーン', part: '全身', equipment: 'barbell', icon: '⚡', reserve: true,
    description: '床から肩まで一気にバーを引き上げる。全身の爆発力を高めるラグビーの定番種目。',
    points: ['必ず軽い重量でフォームを習得してから', '脚で床を蹴る力でバーを跳ね上げる'],
    youtubeQuery: 'パワークリーン+やり方',
  },
  {
    id: 'sled-push', name: 'スレッドプッシュ', part: '全身', equipment: 'other', icon: '🛷', reserve: true,
    description: 'そりを押して進む。スクラムやラックで押し込む力を鍛える。',
    points: ['体を前傾させ、腕を伸ばしてそりを押す', '短い歩幅で力強く踏み込む'],
    youtubeQuery: 'スレッドプッシュ+トレーニング',
  },
  {
    id: 'box-jump', name: 'ボックスジャンプ', part: '全身', equipment: 'other', icon: '📦', reserve: true,
    description: '台に飛び乗る。脚の瞬発力を高める。',
    points: ['着地は静かに、膝を軽く曲げて', '降りるときは歩いて降りる'],
    youtubeQuery: 'ボックスジャンプ+やり方',
  },
  {
    id: 'med-ball-slam', name: 'メディシンボール・スラム', part: '全身', equipment: 'other', icon: '🏐', reserve: true,
    description: 'ボールを頭上から床に叩きつける。全身の瞬発力と体幹を鍛える。',
    points: ['つま先立ちで頭上に構える', 'お腹の力で一気に叩きつける'],
    youtubeQuery: 'メディシンボールスラム+やり方',
  },
];

export const EXERCISES: readonly ExerciseDef[] = defs;

const byId = new Map(defs.map(d => [d.id, d]));
const byName = new Map(defs.map(d => [d.name, d]));

export function getExercise(id: string): ExerciseDef {
  const def = byId.get(id);
  if (!def) throw new Error(`Unknown exercise id: ${id}`);
  return def;
}

export function findExerciseByName(name: string): ExerciseDef | undefined {
  return byName.get(name);
}

export function exerciseImageUrl(def: ExerciseDef): string {
  return def.hasImage ? `/images/exercises/${def.id}.jpg` : '';
}

export function youtubeSearchUrl(def: ExerciseDef): string {
  return `https://www.youtube.com/results?search_query=${def.youtubeQuery}`;
}

// 記録画面の種目選択用 (器具ごとのグループ、ラベルは「[部位] 種目名」)
const EQUIPMENT_GROUPS: { group: string; equipment: Equipment[] }[] = [
  { group: '🏋️ バーベル', equipment: ['barbell'] },
  { group: '💪 ダンベル・ケトルベル', equipment: ['dumbbell', 'kettlebell'] },
  { group: '🤖 マシン・ケーブル', equipment: ['machine', 'cable'] },
  { group: '🤸 自重・その他', equipment: ['bodyweight', 'other'] },
];

export const EXERCISE_GROUPS = EQUIPMENT_GROUPS.map(g => ({
  group: g.group,
  items: defs
    .filter(d => g.equipment.includes(d.equipment))
    .map(d => ({ label: `[${d.part}] ${d.name}`, value: d.name })),
}));

# Play Mode 仕様

プレイモードの役割と状態遷移についてまとめる。

プレイモード

- normal
- playlist

## `normal`: Normal Mode

- コントロールパネルから個別にプロトタイプを表示出来る。

### `playlist`: Play playlist Mode

- 指定されたプロトタイプIDのリストに基づいて、連続的にプロトタイプを表示するモード。
- 指定されたプロトタイプID全てを処理した後も、プレイモードは変わらない。

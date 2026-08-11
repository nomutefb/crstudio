# download-artists.ps1 — 예울마루 작가 이미지 내려받기 (한 번 실행 후 삭제 가능)
$ErrorActionPreference = "Continue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$dest = Join-Path $repo "assets\uploads\artists"
$manifest = New-Object System.Collections.Generic.List[string]
$rows = @"
kim-seoryang|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120260623105100.jpg
kim-seoryang|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120260203111045.jpg
kim-seoryang|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220260203111045.jpg
kim-seoryang|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320260203111045.jpg
kim-seoryang|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420260203111045.jpg
kim-seoryang|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520260203111045.jpg
kim-seoryang|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620260203111045.jpg
kim-seoryang|work-07.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01720260203111045.jpg
kim-seoryang|work-08.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01820260203111045.jpg
kim-seoryang|work-09.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01920260203111045.jpg
kim-seoryang|work-10.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v011020260203111045.jpg
park-keumman|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120260623105035.jpg
park-keumman|work-01.png|https://www.yeulmaru.org/inday_fileinfo/img/v01120260128143151.png
park-keumman|work-02.png|https://www.yeulmaru.org/inday_fileinfo/img/v01220260128143151.png
park-keumman|work-03.png|https://www.yeulmaru.org/inday_fileinfo/img/v01320260128143151.png
park-keumman|work-04.png|https://www.yeulmaru.org/inday_fileinfo/img/v01420260128143151.png
park-keumman|work-05.png|https://www.yeulmaru.org/inday_fileinfo/img/v01520260128143151.png
park-keumman|work-06.png|https://www.yeulmaru.org/inday_fileinfo/img/v01620260128143151.png
park-keumman|work-07.png|https://www.yeulmaru.org/inday_fileinfo/img/v01720260128143151.png
park-keumman|work-08.png|https://www.yeulmaru.org/inday_fileinfo/img/v01820260128143151.png
park-keumman|work-09.png|https://www.yeulmaru.org/inday_fileinfo/img/v01920260128143151.png
park-keumman|work-10.png|https://www.yeulmaru.org/inday_fileinfo/img/v011020260128143151.png
an-minhwan|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120260623105007.jpg
an-minhwan|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120260303143220.jpg
an-minhwan|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220260303143220.jpg
an-minhwan|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320260303143220.jpg
an-minhwan|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420260303143220.jpg
an-minhwan|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520260303143220.jpg
an-minhwan|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620260303143220.jpg
an-minhwan|work-07.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01720260303143220.jpg
an-minhwan|work-08.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01820260303143220.jpg
an-minhwan|work-09.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01920260303143220.jpg
an-minhwan|work-10.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v011020260303143220.jpg
chung-hyeryung|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120260623105049.jpg
chung-hyeryung|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120260128131736.jpg
chung-hyeryung|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220260128131736.jpg
chung-hyeryung|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320260128131736.jpg
chung-hyeryung|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420260128131736.jpg
chung-hyeryung|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520260128131736.jpg
chung-hyeryung|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620260128131736.jpg
chung-hyeryung|work-07.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01720260128131736.jpg
chung-hyeryung|work-08.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01820260128131736.jpg
chung-hyeryung|work-09.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01920260128131736.jpg
chung-hyeryung|work-10.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v011020260128131736.jpg
kim-youngjin|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120250220104801.jpg
kim-youngjin|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120251107142155.jpg
kim-youngjin|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220251107142155.jpg
kim-youngjin|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320251107142155.jpg
kim-youngjin|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420251107142155.jpg
kim-youngjin|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520251107142155.jpg
kim-youngjin|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620251107142155.jpg
kim-heesoo|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120250220105827.JPG
kim-heesoo|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120251113170252.jpg
kim-heesoo|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220251113170252.jpg
kim-heesoo|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320251113170252.jpg
kim-heesoo|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420251113170252.jpg
kim-heesoo|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520251113170252.jpg
kim-heesoo|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620251113170252.jpg
hyung-seirin|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120250220110623.jpg
hyung-seirin|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120251202164657.jpg
hyung-seirin|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220251202164657.jpg
hyung-seirin|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320251202164657.jpg
hyung-seirin|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420251202164657.jpg
hyung-seirin|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520251202164657.jpg
hyung-seirin|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620251202164657.jpg
hong-wonpey|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120250312090304.jpg
hong-wonpey|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120250911171823.jpg
hong-wonpey|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220250911171823.jpg
hong-wonpey|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320250911171823.jpg
hong-wonpey|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420250911171823.jpg
hong-wonpey|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520250911171823.jpg
hong-wonpey|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620250911171823.jpg
kim-yongwon|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120240208112355.jpg
kim-yongwon|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120250724163909.jpg
kim-yongwon|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220250724163909.jpg
kim-yongwon|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320250724163909.jpg
kim-yongwon|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420250724163909.jpg
kim-yongwon|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520250724163909.jpg
kim-yongwon|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620250724163909.jpg
kim-yonghyun|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120240208112942.JPG
kim-yonghyun|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120250724165123.jpg
kim-yonghyun|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220250724165123.jpg
kim-yonghyun|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320250724165123.jpg
kim-yonghyun|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420250724165123.jpg
kim-yonghyun|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520250724165123.jpg
kim-yonghyun|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620250724165123.jpg
lee-mikyoung|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120240416111915.jpg
lee-mikyoung|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120240720165839.JPG
lee-mikyoung|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220240720165839.JPG
lee-mikyoung|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320240720165839.JPG
lee-mikyoung|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420240720165839.JPG
lee-mikyoung|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520240720165839.JPG
lee-mikyoung|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620240720165839.JPG
lee-yeonsook|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/0120240213092236.jpg
lee-yeonsook|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120250724170426.jpg
lee-yeonsook|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220250724170426.jpg
lee-yeonsook|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320250724170426.jpg
lee-yeonsook|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420250724170426.jpg
lee-yeonsook|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520250724170426.jpg
lee-yeonsook|work-06.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01620250724170426.jpg
kunam-collective|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120230302084235.jpg
kunam-collective|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120250724113128.jpg
kunam-collective|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220250724113128.jpg
kunam-collective|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320250724113128.jpg
kunam-collective|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420250724113128.jpg
kunam-collective|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520250724113128.jpg
baek-sooyeoun|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120230302084951.jpg
baek-sooyeoun|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120250724112825.jpg
baek-sooyeoun|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220250724112825.jpg
baek-sooyeoun|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320250724112825.jpg
baek-sooyeoun|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420250724112825.jpg
baek-sooyeoun|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520250724112825.jpg
lim-youngki|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120230302105646.jpg
lim-youngki|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120250724113447.jpg
lim-youngki|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220250724113447.jpg
lim-youngki|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320250724113447.jpg
lim-youngki|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420250724113447.jpg
lim-youngki|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520250724113447.jpg
kang-un|portrait.png|https://www.yeulmaru.org/inday_fileinfo/img/120220424160443.png
kang-un|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120230305135512.jpg
kang-un|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/220230305135512.jpg
kang-un|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/320230305135512.jpg
kang-un|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/420230305135512.jpg
kang-un|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/520230305135512.jpg
kim-bangjoo|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120220304171818.jpg
kim-bangjoo|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120221230143850.jpg
kim-bangjoo|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/220221230143850.jpg
kim-bangjoo|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/320221230143850.jpg
kim-bangjoo|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/420221230143850.jpg
kim-bangjoo|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/520221230143850.jpg
sa-yuntaek|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120220308105008.jpg
sa-yuntaek|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120221130151329.jpg
sa-yuntaek|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/220221130151329.jpg
sa-yuntaek|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/320221130151329.jpg
sa-yuntaek|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/420221130151329.jpg
sa-yuntaek|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/520221130151329.jpg
seo-kukhwa|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120220309140309.jpg
seo-kukhwa|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/220221104132410.jpg
seo-kukhwa|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/320221104132410.jpg
seo-kukhwa|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/420221104132410.jpg
seo-kukhwa|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/520221104132410.jpg
seo-kukhwa|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/620221104132410.jpg
ji-sungbae|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120220424160345.jpg
ji-sungbae|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/920221104134225.jpg
ji-sungbae|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/1020221104134225.jpg
ji-sungbae|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/1120221104134225.jpg
ji-sungbae|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/1220221104134225.jpg
ji-sungbae|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/1320221104134225.jpg
chung-hyun|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01120240607100145.jpg
chung-hyun|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01220240607100145.jpg
chung-hyun|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01320240607100145.jpg
chung-hyun|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01420240607100145.jpg
chung-hyun|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/v01520240607100145.jpg
kim-chaerin|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120210514155524.jpg
kim-chaerin|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120220226143059.jpg
kim-chaerin|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/220220226143059.jpg
kim-chaerin|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/320220226143059.jpg
kim-chaerin|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/420220226143059.jpg
kim-chaerin|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/520220226143059.jpg
oh-wonbae|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120210514155414.jpg
oh-wonbae|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120210819102013.jpg
oh-wonbae|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/220210819102013.jpg
oh-wonbae|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/320210819102013.jpg
oh-wonbae|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/420210819102013.jpg
oh-wonbae|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/520210819102013.jpg
lee-yulbae|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120210514155121.jpg
lee-yulbae|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/420220226141623.jpg
lee-yulbae|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/520220226141623.jpg
lee-yulbae|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/620220226141623.jpg
lee-yulbae|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/720220226141623.jpg
lee-yulbae|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/820220226141623.jpg
lee-inhye|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120210819114255.jpg
lee-inhye|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120220107115447.jpg
lee-inhye|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/220220107115447.jpg
lee-inhye|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/320220107115447.jpg
lee-inhye|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/420220107115447.jpg
lee-inhye|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/520220107115447.jpg
jeong-yumi|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120210514154933.jpg
jeong-yumi|work-01.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120220107114327.jpg
jeong-yumi|work-02.jpg|https://www.yeulmaru.org/inday_fileinfo/img/220220107114327.jpg
jeong-yumi|work-03.jpg|https://www.yeulmaru.org/inday_fileinfo/img/320220107114327.jpg
jeong-yumi|work-04.jpg|https://www.yeulmaru.org/inday_fileinfo/img/420220107114327.jpg
jeong-yumi|work-05.jpg|https://www.yeulmaru.org/inday_fileinfo/img/520220107114327.jpg
aaa-union|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120210309145727.jpg
aaa-union|work-01.png|https://www.yeulmaru.org/inday_fileinfo/img/120210310174753.png
aaa-union|work-02.png|https://www.yeulmaru.org/inday_fileinfo/img/320210310174753.png
aaa-union|work-03.png|https://www.yeulmaru.org/inday_fileinfo/img/420210310174753.png
aaa-union|work-04.png|https://www.yeulmaru.org/inday_fileinfo/img/520210310174753.png
aaa-union|work-05.png|https://www.yeulmaru.org/inday_fileinfo/img/620210310174753.png
lee-minha|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120200630101857.jpg
lee-minha|work-01.png|https://www.yeulmaru.org/inday_fileinfo/img/120210411110754.png
lee-minha|work-02.png|https://www.yeulmaru.org/inday_fileinfo/img/220210411110754.png
lee-minha|work-03.png|https://www.yeulmaru.org/inday_fileinfo/img/320210411110754.png
lee-minha|work-04.png|https://www.yeulmaru.org/inday_fileinfo/img/420210411110754.png
lee-minha|work-05.png|https://www.yeulmaru.org/inday_fileinfo/img/520210411110754.png
lee-jiyeon-sung-jeongwon|portrait.jpg|https://www.yeulmaru.org/inday_fileinfo/img/120200630102258.jpg
lee-jiyeon-sung-jeongwon|work-01.png|https://www.yeulmaru.org/inday_fileinfo/img/120210311114942.png
lee-jiyeon-sung-jeongwon|work-02.png|https://www.yeulmaru.org/inday_fileinfo/img/320210311114942.png
lee-jiyeon-sung-jeongwon|work-03.png|https://www.yeulmaru.org/inday_fileinfo/img/420210311114942.png
lee-jiyeon-sung-jeongwon|work-04.png|https://www.yeulmaru.org/inday_fileinfo/img/520210311114942.png
lee-jiyeon-sung-jeongwon|work-05.png|https://www.yeulmaru.org/inday_fileinfo/img/620210311114942.png
"@ -split "`n"
$i = 0
foreach ($row in $rows) {
  $row = $row.Trim(); if (-not $row) { continue }
  $parts = $row -split "\|"; $slug = $parts[0]; $file = $parts[1]; $url = $parts[2]
  $dir = Join-Path $dest $slug
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $out = Join-Path $dir $file
  try {
    Invoke-WebRequest -Uri $url -OutFile $out -TimeoutSec 40 -UseBasicParsing
    $len = (Get-Item $out).Length
    if ($len -gt 800) { $manifest.Add("$slug|$file|$len") } else { Remove-Item $out -Force }
  } catch { Write-Host "FAIL $url" }
  $i++
}
$manifest | Set-Content -Encoding utf8 (Join-Path $repo "_dl_manifest.txt")
Write-Host "DONE $($manifest.Count) files"

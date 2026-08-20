# promo — 홍보물 소스

기획공연 STAY 패키지 안내메일에 쓰인 파일들입니다.
**웹용과 메일용이 따로 있으니 헷갈리지 마세요.**

## 파일 안내

| 파일 | 용도 | 메일에 붙여넣기 |
|---|---|---|
| `stay-img/SNIPPET.html` | 이미지 5장 + 클릭 좌표 오버레이 | **○ 그대로 사용** |
| `stay-booking-mail.html` | 예매 버튼 3종 (인라인 스타일) | **○ 그대로 사용** |
| `stay-booking.html` | 예매 버튼 3종 (웹 미리보기용) | **✗ 쓰면 깨짐** |
| `stay.html` | 전체 페이지 원본 | ✗ |
| `stay-img/meta.json` | 슬라이스 좌표 원본 데이터 | ✗ |

## 왜 버튼 파일이 두 개인가

`stay-booking.html` 은 `display:flex`, `gap`, `<style>` 블록, `:hover` 를 씁니다.
브라우저에서는 잘 보이지만 **아웃룩을 비롯한 여러 메일 클라이언트에서 동작하지
않습니다.** 그래서 같은 모양을 `float` + 인라인 스타일로만 다시 짠 것이
`stay-booking-mail.html` 입니다. 메일에는 반드시 `-mail` 쪽을 쓰세요.

## 메일 구성 순서

    1. 최상단 배너 이미지
    2. stay-booking-mail.html      <- 예매 버튼
    3. stay-img/SNIPPET.html       <- STAY 이미지 5장
    4. stay-booking-mail.html      <- 예매 버튼 (한 번 더)

## 이미지 호스팅

이미지는 `https://yeulmaru.github.io/promo/stay-img/` 에서 서빙됩니다.
저장소는 `yeulmaru/yeulmaru.github.io` 이며, 이 저장소(crstudio)와는 별개입니다.

원본 png 는 `stay-img/` 에도 그대로 두었습니다. 호스팅을 다른 곳으로 옮기게
되면 이 파일들을 올리고 `SNIPPET.html` 의 `src` 주소만 바꾸면 됩니다.

> 이미 발송한 메일이 참조하는 주소는 **바꾸거나 지우지 마세요.**
> 메일은 회수할 수 없으므로 그 주소는 계속 살아 있어야 합니다.

## 편집 시 주의

`SNIPPET.html` 의 링크는 이미지 위에 `position:absolute` 와 퍼센트 좌표로
얹혀 있습니다. 위지윅 편집기가 이 속성을 지우면 링크가 엉뚱한 위치로
내려앉습니다. 붙여넣은 뒤 소스 모드를 다시 열어 `position:absolute` 가
남아 있는지 확인하세요.

좌표를 다시 계산해야 한다면 `stay-img/meta.json` 에 원본 픽셀 좌표가 있습니다.

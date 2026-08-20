# CREATIVE STUDIO — 기수별 입주작가 아카이브 사이트

The Cultivist 에이전시 페이지의 정보 구조(히어로 → 소개 → 프로젝트 → 밴드 → 인용 → 아코디언 → CTA)에
2026 웨비어워즈 수상작 스타일의 대형 타이포그래피를 결합한 **자체 제작 디자인**입니다.
콘텐츠(작가 명단·기수)는 예울마루 창작스튜디오 공개 정보를 기반으로 하고, 나머지 문구는 전부 교체 가능한 자리표시 문구입니다.

- 배포 주소: **https://crstudio-3re.pages.dev/**
- 관리자 페이지: **https://crstudio-3re.pages.dev/admin/**

---

## 1. 처음 한 번만 하는 설정

### ① 호스팅 (Cloudflare Pages)
`yeulmaru/crstudio` 저장소가 Cloudflare Pages 프로젝트 `crstudio`(배포 주소 `crstudio-3re.pages.dev`)에 연결됩니다.
`main`에 push하면 자동으로 빌드·배포됩니다. 빌드 설정은 다음과 같습니다.

| 항목 | 값 |
|---|---|
| 빌드 명령 | `bundle exec jekyll build --baseurl ""` |
| 빌드 출력 디렉터리 | `_site` |
| 프로덕션 분기 | `main` |

### ② 관리자 로그인용 토큰 만들기
게시물을 올릴 사람(관리자)은 GitHub 토큰 하나만 있으면 됩니다.

1. https://github.com/settings/personal-access-tokens → **Generate new token** (Fine-grained)
2. Repository access: **Only select repositories → yeulmaru/crstudio**
3. Permissions → Repository permissions → **Contents: Read and write**
4. 토큰 문자열 복사

### ③ 관리자 로그인
1. `https://crstudio-3re.pages.dev/admin/` 접속
2. **Sign In with Token** 클릭 → 복사한 토큰 붙여넣기
3. 끝. (토큰은 브라우저에만 저장됩니다. 레포 쓰기 권한이 있는 계정만 게시 가능 = 관리자 인증)

---

## 2. 게시물 올리는 법 (평소 사용법)

1. `/admin` 접속 → 로그인
2. 왼쪽 메뉴에서
   - **게시물** → 전시/프로그램/소식 글쓰기 (커버·갤러리 이미지 업로드 가능)
   - **작가** → 작가 소개·프로필 사진·작업 이미지 등록, 새 기수 작가 추가
   - **사이트 설정** → 메인 화면의 모든 문구(히어로/소개/숫자/인용/문의) 수정
3. **저장(Publish)** 누르면 자동으로 커밋 → 약 1분 뒤 사이트에 반영

> 이미지는 저장 시 `assets/uploads/`에 자동 업로드됩니다.

---

## 3. 디자인 기틀

모든 디자인·수정 작업은 **[DESIGN.md](DESIGN.md)** 를 따릅니다.
색·타이포·간격·모션 값은 `assets/css/tokens.css` 한 곳에서만 정의합니다.

## 4. 구조

```
_artists/     작가 문서 (기수·이름·소개·이미지) — 29명 등록됨
_projects/    게시물 (예시 3개 — 수정/삭제하고 쓰세요)
_data/settings.yml  사이트 전체 문구
_layouts/, _includes/  템플릿
assets/css, assets/js  디자인·인터랙션
assets/img/ph  이미지 없을 때 나오는 기본 그래픽 6종
admin/        관리자 페이지 (Sveltia CMS)
Cloudflare Pages   push → 자동 빌드·배포 (대시보드에서 설정)
```

## 5. 알아두기

- 작가 29명의 프로필 사진·작업 이미지(총 200여 장)·장르·이력 요약은 예울마루 창작스튜디오 공식 아카이브 기준으로 채워져 있습니다. 수정·보완은 `/admin → 작가`에서 하면 됩니다.
- 예술인연합AAA는 공식 영문 표기가 없어 국문 이름으로 표시됩니다.
- 로컬 미리보기(선택): `bundle install` 후 `bundle exec jekyll serve --baseurl ""`
- 레포 이름이나 배포 주소가 바뀌면 `admin/config.yml`의 `repo`/`site_url`/`display_url`, `_config.yml`의 `url`도 같이 바꿔야 합니다.
- Cloudflare Pages는 루트(`/`)로 서빙되므로 `baseurl`은 빈 문자열입니다. GitHub Pages처럼 하위 경로로 옮길 경우에만 `baseurl`을 채우세요.

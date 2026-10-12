# Font asset provenance

The six Linux Libertine WOFF files in this directory are unchanged original files from the author's 5.3.0 release archive.

Official release page
https://sourceforge.net/projects/linuxlibertine/files/linuxlibertine/5.3.0/

Downloaded archive
https://downloads.sourceforge.net/project/linuxlibertine/linuxlibertine/5.3.0/LinLibertineWOFF_5.3.0_2012_07_02.tgz

Archive SHA-256
`b68e5154f7ff0f97d72ee5c9f1de3e3fcba89dfb51d86257b655b11812d5b4b9`

This matches the SHA-256 published on the official SourceForge download page. The archive was fetched and inspected on 2026-10-12. Its original `OFL-1.1.txt`, `LICENCE.txt`, and `GPL.txt` are included alongside the font files. Distribution of these original files uses the SIL Open Font License 1.1. Copyright is held by Philipp H. Poll, 2003–2012.

| File | CSS weight | CSS style | Embedded font version |
| --- | --- | --- | --- |
| LinLibertine_R.woff | 400 | normal | 5.3.0 |
| LinLibertine_RI.woff | 400 | italic | 5.1.6 |
| LinLibertine_RZ.woff | 600 | normal | 5.1.2 |
| LinLibertine_RZI.woff | 600 | italic | 5.1.2 |
| LinLibertine_RB.woff | 700 | normal | 5.1.4 |
| LinLibertine_RBI.woff | 700 | italic | 5.1.8 |

The original release contains different embedded version numbers for individual family members. Their name-table family is `Linux Libertine O`. Web CSS can give these files the shared face name `Linux Libertine` and map the weights and styles shown above. Their source format is `woff`.

The project and the scoped system/user font directories had no GT America font asset. A browser can use a separately licensed installed copy through `local()` and otherwise use the platform sans-serif stack. For example, the regular face can be declared under the alias `GT America Local` with `src: local('GT America'), local('GT America Regular'), local('GTAmerica-Regular')`. The corresponding UI stack is `'GT America Local', 'GT America', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`. A local-only declaration adds no proprietary font to the website.

GT America is available from its designer and publisher at https://www.grillitype.com/typeface/gt-america. The files in this directory contain Linux Libertine only. Reference-site font binaries were neither fetched nor copied.

Libertinus is an alternative open font family descended from Linux Libertine. Its official project and license are https://github.com/alerque/libertinus and https://github.com/alerque/libertinus/blob/master/OFL.txt. The current website assets use the requested original Linux Libertine family.

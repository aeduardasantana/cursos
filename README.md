# GEB Cursos — Plataforma de cursos autorais do GEB Educação

Domínio previsto: https://cursos.grupoeduardabispo.com.br. Código estático publicado pela Locaweb em `public_html/cursos`.

## Conteúdo
- Catálogo: NR-1/NR-17 (12 módulos, 37 aulas redigidas no Drive, ainda em revisão de SST, ciência, avaliação, acessibilidade e piloto; não homologado), Vocabulário Executivo (90 termos).
- Aula demonstrativa de markup, calculadora, glossário filtrável e pronúncia em inglês (dependente das vozes do navegador).
- Leitor por síntese de voz, aumento de fontes, navegação por teclado, widget VLibras oficial.

## Governança
A formação NR-1 foi referenciada pelo Plano Diretor V2 e Guia de Estudos de 06/11/2026. Nenhum arquivo, prova ou gabarito privado do Drive foi publicado. A formação NR-1 só será aberta após as revisões e homologações indicadas pelo próprio Plano Diretor.

## Tecnologia
HTML, CSS e JS; sem contas de aluno e sem dados pessoais persistidos em servidor. Marcação de glossário e exercício persistem apenas no navegador. VLibras é tradução automática e não substitui interpretação humana em cursos. A acessibilidade precisa de testes em dispositivos reais antes de homologação.

## Implantação
A Action de publicação utiliza segredos HOST, USER, PASS e diretório FTP `./public_html/cursos/` seguindo o padrão de repositórios GEB. Verificar logs e página pública: um commit não comprova implantação.

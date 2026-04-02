const SafePage = () => {
  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f4f4f4', color: '#333', margin: 0, padding: 0, lineHeight: 1.6, minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#009B3A', color: '#FFDF00', textAlign: 'center', padding: '2rem 0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>A Sagrada Amarelinha</h1>
      </header>

      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '2rem', alignItems: 'center', background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <div style={{ flex: 1, minWidth: '300px', textAlign: 'center' }}>
            <img src="/assets/camisa_brasil.jpg" alt="Camisa da Seleção Brasileira de Futebol" style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }} />
            <p style={{ fontStyle: 'italic', color: '#666', marginTop: '10px' }}>A icônica camisa amarela da Seleção Brasileira.</p>
          </div>

          <div style={{ flex: 1.5, minWidth: '300px' }}>
            <h2 style={{ color: '#002776', borderBottom: '3px solid #FFDF00', display: 'inline-block', marginBottom: '1.5rem' }}>Curiosidades Incríveis</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                { title: 'O Trauma do Maracanazo', text: 'Originalmente, o Brasil jogava de branco com golas azuis. Após a derrota na final da Copa de 1950, o uniforme foi considerado "azarado" e pouco patriótico.' },
                { title: 'O Concurso de 1953', text: 'Para criar um novo visual, o jornal "Correio da Manhã" abriu um concurso nacional. A regra era usar as quatro cores da bandeira nacional.' },
                { title: 'O Criador Gaúcho', text: 'O vencedor foi Aldyr Garcia Schlee, um jovem de 19 anos de Pelotas (RS). Curiosamente, ele era um grande admirador da seleção do Uruguai!' },
                { title: 'As Cinco Estrelas', text: 'Cada estrela acima do escudo representa um título mundial: 1958, 1962, 1970, 1994 e 2002. O Brasil é o único pentacampeão do mundo.' },
                { title: 'O Apelido "Canarinho"', text: 'O termo foi popularizado pelo radialista Geraldo José de Almeida na Copa de 1954, comparando a cor da camisa ao pássaro canário.' },
                { title: 'Design Moderno (2024)', text: 'A versão mais recente apresenta texturas inspiradas na onça-pintada e na flora brasileira, celebrando a biodiversidade do país.' },
              ].map((item, i) => (
                <li key={i} style={{ background: '#f9f9f9', marginBottom: '1rem', padding: '1rem', borderLeft: '5px solid #009B3A', borderRadius: '0 8px 8px 0' }}>
                  <strong style={{ color: '#002776', display: 'block', marginBottom: '0.3rem' }}>{item.title}</strong>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '2rem', color: '#777', fontSize: '0.9rem' }}>
        <p>&copy; 2026 - Tributo à Seleção Brasileira de Futebol</p>
      </footer>
    </div>
  );
};

export default SafePage;

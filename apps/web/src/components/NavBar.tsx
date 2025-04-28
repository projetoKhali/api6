const Navbar = () => {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          marginRight: 'auto',
        }}
      >
        <a href="/">
          <img src="/kersys-logo.png" alt="" />
        </a>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: '25%',
          justifyContent: 'space-evenly',
          padding: '20px',
          color: '#fff',
        }}
      >
        <a href="/dashboard" style={{ textDecoration: 'none', color: '#fff' }}>
          Dashboard
        </a>
        <div
          style={{
            height: '35px',
            width: '3px',
            backgroundColor: '#fff',
          }}
        ></div>
        <a
          href="/projection"
          style={{ textDecoration: 'none', color: '#fff' }}
        >
          Previsões
        </a>
        <div
          style={{
            height: '35px',
            width: '3px',
            backgroundColor: '#fff',
          }}
        ></div>
        <a href="/register" style={{ textDecoration: 'none', color: '#fff' }}>
          Cadastro
        </a>
        <div
          style={{
            height: '35px',
            width: '3px',
            backgroundColor: '#fff',
          }}
        ></div>
        <a
          href="/user"
          style={{ textDecoration: 'none', color: '#fff' }}
        >
          Usuários
        </a>
      </div>
    </main>
  );
};

export default Navbar;

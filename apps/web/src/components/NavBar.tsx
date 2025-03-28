const Navbar = () => {
    return (
        <main style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center"
        }}>
            <div style={{
                marginRight: "auto"
            }}>
                <img src="/kersys-removebg-preview.png" alt="" />
            </div>
            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                width: "25%",
                justifyContent: "space-evenly",
                padding: "20px",
                color: "#fff"
            }}>
                <a href="/dashboard" style={{ textDecoration: "none", color: "#fff" }}>Dashboard</a>
                    <div style={{
                        height: "35px",
                        width: "3px",
                        backgroundColor: "#fff",
                    }}></div>
                <a href="" style={{textDecoration:"none", color:"#fff"}}>Previsões</a>
                    <div style={{
                        height: "35px",
                        width: "3px",
                        backgroundColor: "#fff"
                    }}></div>
                <a href="/events-register" style={{ textDecoration: "none", color: "#fff" }}>Cadastro</a>
            </div>
        </main>
    )
}



export default Navbar
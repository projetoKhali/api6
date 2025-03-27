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
                <img src="../../public/kersys-removebg-preview.png" alt="" />
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
                {/* <h3>Dasboard</h3> */}
                <a href="" style={{textDecoration:"none", color:"#fff"}}>Dashboard</a>
                    <div style={{
                        height: "35px",
                        width: "3px",
                        backgroundColor: "#fff",
                    }}></div>
                <a href="" style={{textDecoration:"none", color:"#fff"}}>Previsões</a>
                {/* <h3>Previsões</h3> */}
                    <div style={{
                        height: "35px",
                        width: "3px",
                        backgroundColor: "#fff"
                    }}></div>
                <a href="" style={{textDecoration:"none", color:"#fff"}}>Cadastro</a>
                {/* <h3>Cadastro</h3> */}
            </div>
        </main>
    )
}



export default Navbar
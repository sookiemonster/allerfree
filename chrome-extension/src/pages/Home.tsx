import { Link } from "react-router-dom";

function Home()
{
    return(
        <div className="home-page">
            <div className="home-content">
                <img src="/wheat-icon.png" alt="Wheat icon" className="home-wheat-icon" />
                <h1 className="home-title">Allerfree</h1>
                <Link to="/profiles">
                    <button className="circle-arrow-btn">
                        →
                    </button>
                </Link>
            </div>
        </div>
    )
} export default Home
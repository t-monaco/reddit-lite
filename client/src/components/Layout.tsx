import NavBar from "./Navbar"
import Wrapper, { WrapperVariant } from "./Wrapper"

interface LayoutProps {
    variant?: WrapperVariant
}

const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
    return (
        <div>
            <NavBar />
            <Wrapper variant={variant}>
                {children}
            </Wrapper>
        </div>
    )
}

export default Layout
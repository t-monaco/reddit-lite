import NavBar from "./Navbar"
import Wrapper, { WrapperVariant } from "./Wrapper"

interface LayoutProps {
    variant?: WrapperVariant
}

const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
    return (
        <>
            <NavBar />
            <Wrapper variant={variant}>
                {children}
            </Wrapper>
        </>
    )
}

export default Layout
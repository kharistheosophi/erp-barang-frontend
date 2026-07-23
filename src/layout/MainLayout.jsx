import React, { useState, useEffect } from "react";
// ...import lain tetap sama

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (mobile) setCollapsed(true); // default tertutup di mobile
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ...userString, user, handleLogout, profileMenu, menuItems tetap sama

    const handleMenuClick = ({ key }) => {
        navigate(`/${key}`);
        if (isMobile) setCollapsed(true);
    };

    return (
        <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
            {isMobile && !collapsed && (
                <div className="sider-overlay" onClick={() => setCollapsed(true)} />
            )}

            <Sider
                width={260}
                collapsedWidth={isMobile ? 0 : 0}
                collapsed={collapsed}
                onCollapse={setCollapsed}
                breakpoint="lg"
                theme="light"
                trigger={null}
                style={{
                    borderRight: "1px solid #e2e8f0",
                    position: "fixed",
                    height: "100vh",
                    left: 0,
                    top: 0,
                    zIndex: 200,
                    boxShadow: isMobile ? "4px 0 24px rgba(0,0,0,0.15)" : "4px 0 10px rgba(0,0,0,0.02)"
                }}
            >
                {/* isi Sider tetap sama */}
            </Sider>

            <Layout
                style={{
                    marginLeft: isMobile ? 0 : (collapsed ? 0 : 260),
                    background: "transparent",
                    transition: "margin-left 0.2s"
                }}
            >
                <Header style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(12px)",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "64px",
                    position: "sticky",
                    top: 0,
                    zIndex: 99,
                    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
                    gap: "8px",
                    flexWrap: "nowrap"
                }}>
                    {/* isi Header tetap sama, hanya height diturunkan jadi 64px utk mobile */}
                </Header>

                <Content style={{ padding: "16px 12px" }}>
                    <div style={{ minHeight: "calc(100vh - 120px)", animation: "fadeIn 0.5s ease-in-out" }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>

            <style>{`
                .custom-sidebar-menu.ant-menu-light .ant-menu-item-selected {
                    background-color: #f5f3ff !important;
                    color: #6366f1 !important;
                    font-weight: 600;
                    border-radius: 8px !important;
                }
                .ant-menu-item, .ant-menu-submenu-title {
                    border-radius: 8px !important;
                    margin-bottom: 4px !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .sider-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(15, 23, 42, 0.45);
                    z-index: 150;
                }
                @media (max-width: 991px) {
                    .quick-search { width: 160px !important; }
                    .user-name-block { display: none; }
                }
                @media (max-width: 576px) {
                    .quick-search { display: none !important; }
                    .header-divider { display: none; }
                }
            `}</style>
        </Layout>
    );
}
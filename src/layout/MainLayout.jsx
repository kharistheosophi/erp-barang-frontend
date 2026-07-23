import React, { useState } from "react";
import { Layout, Menu, Dropdown, Space, Avatar, Input, Badge, Button, Drawer } from "antd";
import {
    DashboardOutlined,
    DatabaseOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    LogoutOutlined,
    DownOutlined,
    SearchOutlined,
    BellOutlined,
    HistoryOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    RightOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Sider, Content, Header } = Layout;

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth < 992;
        }
        return false;
    });

    // State untuk bottom sheet (submenu di mobile)
    const [activeSubmenu, setActiveSubmenu] = useState(null); // menyimpan object menu yang punya children

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : { NamaLengkap: "Maria", Role: "Administrator" };
    const userName = user.NamaLengkap || "Guest";

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const profileMenu = {
        items: [
            {
                key: 'profile',
                label: (
                    <div style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{userName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{user.Role}</div>
                    </div>
                ),
            },
            { type: 'divider' },
            { key: 'settings', label: 'Account Settings' },
            {
                key: 'logout',
                label: 'Sign Out',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout
            },
        ]
    };

    const menuItems = [
        { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
        {
            key: "master",
            icon: <DatabaseOutlined />,
            label: "Master Data",
            children: [
                { key: "barang", label: "Data Barang" },
                { key: "supplier", label: "Data Supplier" },
                { key: "gudang", label: "Data Gudang" },
            ]
        },
        {
            key: "transaksi",
            icon: <ShoppingCartOutlined />,
            label: "Transaksi",
            children: [
                { key: "pembelian", label: "Pembelian (Faktur)" },
                { key: "mutasi", label: "Mutasi Stok" },
            ]
        },
        {
            key: "inventori",
            icon: <HistoryOutlined />,
            label: "Laporan Stok",
            children: [
                { key: "stok-gudang", label: "Stok per Gudang" },
            ]
        },
        {
            key: "pengaturan",
            icon: <TeamOutlined />,
            label: "User Management",
            children: [
                { key: "users", label: "Daftar Pengguna" },
            ]
        }
    ];

    // Untuk bottom nav: batasi 5 item utama (semua item saat ini pas 5)
    const bottomNavItems = menuItems;

    const currentTopKey = location.pathname.split('/')[1] || 'dashboard';

    // Cari parent key aktif (untuk highlight bottom nav saat child aktif)
    const findParentKey = (childKey) => {
        for (const item of menuItems) {
            if (item.key === childKey) return item.key;
            if (item.children?.some(c => c.key === childKey)) return item.key;
        }
        return 'dashboard';
    };
    const activeBottomKey = findParentKey(currentTopKey);

    const handleMenuClick = ({ key }) => {
        navigate(`/${key}`);
        if (window.innerWidth < 992) {
            setCollapsed(true);
        }
    };

    // Klik item bottom nav
    const handleBottomNavClick = (item) => {
        if (item.children && item.children.length > 0) {
            setActiveSubmenu(item);
        } else {
            navigate(`/${item.key}`);
        }
    };

    const handleBottomSheetSelect = (childKey) => {
        navigate(`/${childKey}`);
        setActiveSubmenu(null);
    };

    return (
        <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
            {/* Overlay gelap saat sider terbuka di mobile (desktop drawer lama, tetap dipakai utk breakpoint 992-... jika perlu) */}
            {!collapsed && (
                <div
                    className="sider-overlay"
                    onClick={() => setCollapsed(true)}
                />
            )}

            <Sider
                width={260}
                collapsedWidth={0}
                collapsed={collapsed}
                onCollapse={setCollapsed}
                breakpoint="lg"
                theme="light"
                trigger={null}
                className="main-sider"
                style={{
                    borderRight: "1px solid #e2e8f0",
                    position: "fixed",
                    height: "100vh",
                    left: 0,
                    top: 0,
                    zIndex: 200,
                    boxShadow: "4px 0 10px rgba(0,0,0,0.02)"
                }}
            >
                <div style={{ padding: "30px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: "35px", height: "35px",
                        background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                        borderRadius: "10px",
                        display: "flex", justifyContent: "center", alignItems: "center",
                        color: "#fff", fontWeight: "bold", fontSize: "14px",
                        boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                        flexShrink: 0
                    }}>E</div>
                    <span style={{ fontWeight: "800", fontSize: "18px", color: "#0f172a", letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
                        Inven<span style={{ color: "#6366f1" }}>Sys</span>
                    </span>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[currentTopKey]}
                    defaultOpenKeys={['master', 'transaksi']}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0, padding: "0 12px" }}
                    items={menuItems}
                    className="custom-sidebar-menu"
                />
            </Sider>

            <Layout
                className="main-layout-content"
                style={{
                    marginLeft: collapsed ? 0 : 260,
                    background: "transparent",
                    transition: "margin-left 0.2s"
                }}
            >
                <Header className="main-header" style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(12px)",
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "75px",
                    position: "sticky",
                    top: 0,
                    zIndex: 99,
                    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
                    gap: "12px",
                    flexWrap: "nowrap"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", minWidth: 0 }}>
                        {/* Tombol fold sidebar disembunyikan di mobile via CSS (.sider-toggle-btn) */}
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="sider-toggle-btn"
                            style={{ color: "#64748b", flexShrink: 0 }}
                        />
                        <Input
                            placeholder="Quick search..."
                            variant="filled"
                            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                            className="quick-search"
                            style={{
                                width: "320px",
                                borderRadius: "10px",
                                background: "#f1f5f9",
                                border: "none",
                                height: "40px"
                            }}
                        />
                        {/* Logo kecil muncul di mobile, menggantikan search yang hilang */}
                        <span className="mobile-brand">
                            Inven<span style={{ color: "#6366f1" }}>Sys</span>
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                        <Badge count={3} dot offset={[-2, 5]} color="#6366f1">
                            <Button
                                type="text"
                                shape="circle"
                                icon={<BellOutlined style={{ fontSize: "20px", color: "#64748b" }} />}
                            />
                        </Badge>

                        <div className="header-divider" style={{ width: "1px", height: "24px", background: "#e2e8f0" }} />

                        <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
                            <Space style={{ cursor: 'pointer' }}>
                                <div className="user-name-block" style={{ textAlign: "right", lineHeight: "1.4" }}>
                                    <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px" }}>{userName}</div>
                                    <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "500" }}>{user.Role}</div>
                                </div>
                                <Avatar
                                    size={40}
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
                                    style={{
                                        backgroundColor: '#f1f5f9',
                                        border: "2px solid #e2e8f0",
                                        padding: "2px"
                                    }}
                                />
                                <DownOutlined style={{ fontSize: '10px', color: "#94a3b8" }} />
                            </Space>
                        </Dropdown>
                    </div>
                </Header>

                <Content className="main-content" style={{ padding: "24px 16px" }}>
                    <div style={{
                        minHeight: "calc(100vh - 140px)",
                        animation: "fadeIn 0.5s ease-in-out"
                    }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>

            {/* ===== BOTTOM NAVIGATION BAR (khusus mobile) ===== */}
            <div className="bottom-nav">
                {bottomNavItems.map((item) => {
                    const isActive = activeBottomKey === item.key;
                    return (
                        <div
                            key={item.key}
                            className={`bottom-nav-item ${isActive ? "active" : ""}`}
                            onClick={() => handleBottomNavClick(item)}
                        >
                            <div className="bottom-nav-icon">{item.icon}</div>
                            <span className="bottom-nav-label">{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* ===== BOTTOM SHEET untuk submenu (mobile) ===== */}
            <Drawer
                placement="bottom"
                open={!!activeSubmenu}
                onClose={() => setActiveSubmenu(null)}
                closable={false}
                height="auto"
                className="submenu-sheet"
                styles={{
                    body: { padding: "8px 0 24px" },
                    content: { borderRadius: "20px 20px 0 0" }
                }}
            >
                {activeSubmenu && (
                    <>
                        <div className="submenu-sheet-handle" />
                        <div className="submenu-sheet-title">
                            {activeSubmenu.icon}
                            <span>{activeSubmenu.label}</span>
                        </div>
                        {activeSubmenu.children.map((child) => (
                            <div
                                key={child.key}
                                className={`submenu-sheet-item ${currentTopKey === child.key ? "active" : ""}`}
                                onClick={() => handleBottomSheetSelect(child.key)}
                            >
                                <span>{child.label}</span>
                                <RightOutlined style={{ fontSize: "12px", color: "#94a3b8" }} />
                            </div>
                        ))}
                    </>
                )}
            </Drawer>

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
                .sider-overlay { display: none; }
                .mobile-brand { display: none; font-weight: 800; font-size: 17px; color: #0f172a; }
                .bottom-nav { display: none; }

                /* ===== MOBILE & TABLET (<= 991px): sidebar hilang total, bottom nav muncul ===== */
                @media (max-width: 991px) {
                    .main-sider { display: none !important; }
                    .sider-overlay { display: none !important; }
                    .sider-toggle-btn { display: none !important; }
                    .quick-search { display: none !important; }
                    .mobile-brand { display: inline-block; }
                    .user-name-block { display: none; }

                    .main-layout-content {
                        margin-left: 0 !important;
                    }

                    .main-content {
                        padding: 16px 10px !important;
                        padding-bottom: 88px !important; /* ruang utk bottom nav */
                    }

                    .bottom-nav {
                        display: flex;
                        position: fixed;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        height: 64px;
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(14px);
                        border-top: 1px solid #e2e8f0;
                        box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
                        z-index: 300;
                        padding-bottom: env(safe-area-inset-bottom, 0px);
                    }

                    .bottom-nav-item {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 3px;
                        cursor: pointer;
                        color: #94a3b8;
                        transition: color 0.15s ease;
                        -webkit-tap-highlight-color: transparent;
                    }

                    .bottom-nav-icon {
                        font-size: 20px;
                        line-height: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: transform 0.15s ease;
                    }

                    .bottom-nav-item.active {
                        color: #6366f1;
                    }
                    .bottom-nav-item.active .bottom-nav-icon {
                        transform: translateY(-1px) scale(1.08);
                    }

                    .bottom-nav-label {
                        font-size: 10.5px;
                        font-weight: 600;
                        white-space: nowrap;
                    }
                }

                @media (max-width: 576px) {
                    .header-divider { display: none; }
                    .main-header {
                        height: 64px !important;
                        padding: 0 12px !important;
                    }
                }

                @media (max-width: 400px) {
                    .bottom-nav-label { font-size: 9.5px; }
                    .main-content { padding: 14px 8px !important; padding-bottom: 84px !important; }
                }

                /* ===== BOTTOM SHEET (submenu) ===== */
                .submenu-sheet-handle {
                    width: 40px;
                    height: 4px;
                    background: #e2e8f0;
                    border-radius: 4px;
                    margin: 0 auto 14px;
                }
                .submenu-sheet-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 20px 12px;
                    font-weight: 700;
                    font-size: 15px;
                    color: #1e293b;
                    border-bottom: 1px solid #f1f5f9;
                    margin-bottom: 6px;
                }
                .submenu-sheet-title svg { color: #6366f1; }
                .submenu-sheet-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 20px;
                    font-size: 14.5px;
                    color: #334155;
                    cursor: pointer;
                }
                .submenu-sheet-item:active {
                    background: #f5f3ff;
                }
                .submenu-sheet-item.active {
                    color: #6366f1;
                    font-weight: 600;
                    background: #f5f3ff;
                }
            `}</style>
        </Layout>
    );
}
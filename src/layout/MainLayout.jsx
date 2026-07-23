import React, { useState } from "react";
import { Layout, Menu, Dropdown, Space, Avatar, Input, Badge, Button } from "antd";
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
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Sider, Content, Header } = Layout;

export default function MainLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // Sidebar otomatis tertutup di awal jika layar mobile (< 992px)
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth < 992;
        }
        return false;
    });

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

    // Klik menu di mobile -> auto collapse sider setelah navigasi
    const handleMenuClick = ({ key }) => {
        navigate(`/${key}`);
        if (window.innerWidth < 992) {
            setCollapsed(true);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
            {/* Overlay gelap saat sider terbuka di mobile */}
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
                    selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
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
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
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
                    display: none;
                }

                /* ===== TABLET & MOBILE (<= 991px) ===== */
                @media (max-width: 991px) {
                    .quick-search { width: 180px !important; }
                    .user-name-block { display: none; }

                    /* Sidebar jadi drawer/overlay: konten tidak ikut terdorong */
                    .main-layout-content {
                        margin-left: 0 !important;
                    }

                    /* Lapisan gelap di belakang sider saat terbuka */
                    .sider-overlay {
                        display: block !important;
                        position: fixed;
                        inset: 0;
                        background: rgba(15, 23, 42, 0.45);
                        z-index: 150;
                        animation: fadeIn 0.2s ease-in-out;
                    }
                }

                /* ===== MOBILE (<= 576px) ===== */
                @media (max-width: 576px) {
                    .quick-search { display: none; }
                    .header-divider { display: none; }

                    .main-header {
                        height: 64px !important;
                        padding: 0 12px !important;
                    }

                    .main-content {
                        padding: 16px 10px !important;
                    }
                }

                /* ===== MOBILE SANGAT SEMPIT (<= 400px, mis. layar Android kecil) ===== */
                @media (max-width: 400px) {
                    .main-sider.ant-layout-sider {
                        width: 82vw !important;
                        max-width: 82vw !important;
                        flex: 0 0 82vw !important;
                    }

                    .main-content {
                        padding: 14px 8px !important;
                    }
                }
            `}</style>
        </Layout>
    );
}
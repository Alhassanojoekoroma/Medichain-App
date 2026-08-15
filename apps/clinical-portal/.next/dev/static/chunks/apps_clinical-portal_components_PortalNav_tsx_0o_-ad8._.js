(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/apps/clinical-portal/components/PortalNav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PortalNav",
    ()=>PortalNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/clinical-portal/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/clinical-portal/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/clinical-portal/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const isCurrent = (pathname, href)=>href === '/' ? pathname === '/' : pathname.startsWith(href);
function PortalNav({ canSearch, canUpload }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const items = [
        {
            href: '/',
            label: 'Home',
            visible: true
        },
        {
            href: '/find-patient',
            label: 'Find Patient',
            visible: canSearch
        },
        {
            href: '/upload',
            label: 'Upload or Add Record',
            visible: canUpload
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "mc-nav-pills",
        "aria-label": "Clinical portal",
        children: items.filter((item)=>item.visible).map((item)=>{
            const active = isCurrent(pathname, item.href) || item.href === '/find-patient' && pathname.startsWith('/patients/');
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                className: `mc-nav-pill${active ? ' active' : ''}`,
                "aria-current": active ? 'page' : undefined,
                href: item.href,
                prefetch: false,
                children: item.label
            }, item.href, false, {
                fileName: "[project]/apps/clinical-portal/components/PortalNav.tsx",
                lineNumber: 18,
                columnNumber: 12
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/apps/clinical-portal/components/PortalNav.tsx",
        lineNumber: 16,
        columnNumber: 10
    }, this);
}
_s(PortalNav, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = PortalNav;
var _c;
__turbopack_context__.k.register(_c, "PortalNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=apps_clinical-portal_components_PortalNav_tsx_0o_-ad8._.js.map
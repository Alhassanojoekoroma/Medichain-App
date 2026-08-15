module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/apps/clinical-portal/app/find-patient/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FindPatientPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/clinical-portal/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/clinical-portal/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/design-system/src/web.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$lib$2f$backend$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/clinical-portal/lib/backend.ts [app-rsc] (ecmascript)");
;
;
;
;
const searchBody = (query)=>/^\+?\d[\d\s-]+$/.test(query) ? {
        phone: query.replace(/[\s-]/g, '')
    } : {
        name: query
    };
async function FindPatientPage({ searchParams }) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$lib$2f$backend$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clinicalSession"])();
    const { q = '' } = await searchParams;
    const query = q.trim();
    const allowed = session?.actor.role === 'doctor';
    const result = allowed && query.length >= 2 ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$lib$2f$backend$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["backendPost"])('/api/clinical/patients/match', searchBody(query), [
        404,
        409
    ]) : null;
    const matches = result?.ok ? result.data.matches ?? result.data.candidates.map((id)=>({
            id,
            displayName: 'Identity details unavailable'
        })) : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "mc-page-head",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mc-eyebrow",
                                children: "Step 1 of 3"
                            }, void 0, false, {
                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                lineNumber: 19,
                                columnNumber: 43
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: "Find the correct patient"
                            }, void 0, false, {
                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                lineNumber: 19,
                                columnNumber: 84
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mc-lead",
                                children: "Search by full name or Sierra Leone phone number. Every plausible match remains separate for a staff member to confirm—MediChain never selects the top result silently."
                            }, void 0, false, {
                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                lineNumber: 19,
                                columnNumber: 117
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                        lineNumber: 19,
                        columnNumber: 38
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StatusBadge"], {
                        tone: "primary",
                        children: "Human confirmation required"
                    }, void 0, false, {
                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                        lineNumber: 19,
                        columnNumber: 317
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                lineNumber: 19,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                className: "mc-search-form",
                role: "search",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mc-field",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                htmlFor: "patient-search",
                                children: "Patient search"
                            }, void 0, false, {
                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                lineNumber: 20,
                                columnNumber: 78
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "patient-search",
                                className: "mc-search-input",
                                name: "q",
                                defaultValue: query,
                                minLength: 2,
                                required: true,
                                placeholder: "Full name or +232 phone number",
                                autoComplete: "off"
                            }, void 0, false, {
                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                lineNumber: 20,
                                columnNumber: 132
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                        lineNumber: 20,
                        columnNumber: 52
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "mc-button",
                        type: "submit",
                        disabled: !allowed,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "search",
                                size: 17
                            }, void 0, false, {
                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                lineNumber: 20,
                                columnNumber: 376
                            }, this),
                            " Search securely"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                        lineNumber: 20,
                        columnNumber: 312
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                lineNumber: 20,
                columnNumber: 5
            }, this),
            !session ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Notice"], {
                tone: "warning",
                title: "MFA sign-in required",
                children: "Sign in before searching for any patient identity."
            }, void 0, false, {
                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                lineNumber: 21,
                columnNumber: 17
            }, this) : null,
            session?.actor.role === 'nurse' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Notice"], {
                tone: "warning",
                title: "Patient search is not enabled for nurses",
                children: "Nurse record access remains blocked until the clinical-governance permission decision is approved."
            }, void 0, false, {
                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                lineNumber: 22,
                columnNumber: 40
            }, this) : null,
            result && !result.ok ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Notice"], {
                tone: "danger",
                title: "Patient matching unavailable",
                children: "The service did not return a safe, readable response. No match was guessed."
            }, void 0, false, {
                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                lineNumber: 23,
                columnNumber: 29
            }, this) : null,
            result?.ok && result.data.status === 'none' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EmptyState"], {
                    icon: "search",
                    title: "No matching patient",
                    children: "Check the spelling or phone number. New registration must still pass the duplicate-check gate."
                }, void 0, false, {
                    fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                    lineNumber: 24,
                    columnNumber: 58
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                lineNumber: 24,
                columnNumber: 52
            }, this) : null,
            result?.ok && matches.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Notice"], {
                        tone: result.data.status === 'ambiguous' ? 'warning' : 'info',
                        title: result.data.status === 'ambiguous' ? 'Multiple possible patients' : 'Confirm this identity',
                        children: result.data.status === 'ambiguous' ? 'Compare the details side by side and choose only after an in-person identity check.' : 'One likely match was found, but a human must still confirm it.'
                    }, void 0, false, {
                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                        lineNumber: 25,
                        columnNumber: 43
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "mc-card-grid",
                        "aria-label": "Possible patient matches",
                        children: matches.map((match)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
                                className: "mc-patient-card",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mc-patient-id",
                                                children: [
                                                    "Facility record ",
                                                    match.facilityId ?? match.id
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                                lineNumber: 25,
                                                columnNumber: 562
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                children: match.displayName
                                            }, void 0, false, {
                                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                                lineNumber: 25,
                                                columnNumber: 641
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                        lineNumber: 25,
                                        columnNumber: 557
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mc-patient-meta",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                        children: "Phone"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                                        lineNumber: 25,
                                                        columnNumber: 714
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: match.phoneMasked ?? 'Not displayed'
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                                        lineNumber: 25,
                                                        columnNumber: 728
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                                lineNumber: 25,
                                                columnNumber: 708
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                                        children: "Date of birth"
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                                        lineNumber: 25,
                                                        columnNumber: 796
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: match.dateOfBirth ?? 'Confirm in person'
                                                    }, void 0, false, {
                                                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                                        lineNumber: 25,
                                                        columnNumber: 818
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                                lineNumber: 25,
                                                columnNumber: 790
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                        lineNumber: 25,
                                        columnNumber: 675
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                        className: "mc-button",
                                        href: `/patients/${encodeURIComponent(match.id)}`,
                                        prefetch: false,
                                        children: [
                                            "Confirm and open ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: "shield",
                                                size: 16
                                            }, void 0, false, {
                                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                                lineNumber: 25,
                                                columnNumber: 1003
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                        lineNumber: 25,
                                        columnNumber: 890
                                    }, this)
                                ]
                            }, match.id, true, {
                                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                                lineNumber: 25,
                                columnNumber: 508
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                        lineNumber: 25,
                        columnNumber: 414
                    }, this)
                ]
            }, void 0, true) : null,
            !result && allowed && query.length < 2 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Card"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$clinical$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$design$2d$system$2f$src$2f$web$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EmptyState"], {
                    icon: "search",
                    title: "Start with a patient identifier",
                    children: "Enter at least two characters. Search results are not preloaded, which reduces unnecessary patient-data transfer."
                }, void 0, false, {
                    fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                    lineNumber: 26,
                    columnNumber: 53
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/clinical-portal/app/find-patient/page.tsx",
                lineNumber: 26,
                columnNumber: 47
            }, this) : null
        ]
    }, void 0, true);
}
}),
"[project]/apps/clinical-portal/app/find-patient/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/apps/clinical-portal/app/find-patient/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0t_xgd_._.js.map
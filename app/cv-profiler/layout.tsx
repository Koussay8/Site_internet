'use client';

import CVProfilerSidebar from '@/components/cv-profiler/layout/CVProfilerSidebar';

export default function CVProfilerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="cv-profiler-app" style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF9' }}>
            <CVProfilerSidebar />
            <main className="cvp-main">
                {children}
            </main>
        </div>
    );
}

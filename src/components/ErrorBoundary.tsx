'use client'

import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#EBEAE6] flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
                        <h2 className="text-xl font-black text-[#1E2D40] mb-4">Algo salió mal</h2>
                        <p className="text-sm text-gray-600 mb-6">Hubo un error. Refrescá la página.</p>
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#1E2D40] text-white rounded-xl font-bold hover:bg-[#1E2D40]/90">Recargar página</button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

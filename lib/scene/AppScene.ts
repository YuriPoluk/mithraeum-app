export default interface AppScene {
    update(dt: number): void
    render(dt: number): void
    dispose(): void
    resize(w: number, h: number): void
}
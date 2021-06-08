import * as vscode from 'vscode'

abstract class Disposable {
  private _isDisposed = false
  protected disposables: vscode.Disposable[]

  public constructor() {
    this.disposables = []
  }

  public dispose(): void {
    if (this._isDisposed) {
      return
    }

    this._isDisposed = true
    Disposable.disposeAll(this.disposables)
  }

  protected register<T extends vscode.Disposable>(value: T): T {
    if (this._isDisposed) {
      value.dispose()
    } else {
      this.disposables.push(value)
    }

    return value
  }

  protected get isDisposed(): boolean {
    return this._isDisposed
  }

  public static disposeAll(disposables: vscode.Disposable[]): void {
    while (disposables.length > 0) {
      const disposable = disposables.pop()
      disposable?.dispose()
    }
  }
}

export default Disposable

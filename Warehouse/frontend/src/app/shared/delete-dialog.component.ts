import { Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  template: `
    <dialog #dialog aria-labelledby="delete-title" aria-describedby="delete-description" (cancel)="cancel($event)">
      <div class="symbol" aria-hidden="true">!</div>
      <h2 id="delete-title">¿Eliminar este registro?</h2>
      <p id="delete-description">Vas a eliminar <strong>{{ recordName }}</strong>. Esta acción es permanente y no se puede deshacer.</p>
      <p class="hint">Si solo quieres dejar de utilizarlo, puedes cambiar su estado a inactivo desde Editar.</p>
      <div class="dialog-actions">
        <button type="button" class="cancel" autofocus (click)="finish(false)">Cancelar</button>
        <button type="button" class="delete" (click)="finish(true)">Sí, eliminar</button>
      </div>
    </dialog>
  `,
  styles: [`
    dialog { position: fixed; inset: 0; margin: auto; width: min(460px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); overflow: auto; padding: 28px; border: 0; border-radius: 18px; color: #243247; background: #fff; box-shadow: 0 24px 80px #172a4640; }
    dialog::backdrop { background: #172a4699; backdrop-filter: blur(3px); }
    .symbol { display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 18px; border-radius: 50%; background: #fee2e2; color: #b42332; font-size: 28px; font-weight: 700; }
    h2 { margin: 0 0 12px; font-size: 22px; }
    p { margin: 0 0 16px; line-height: 1.6; overflow-wrap: anywhere; }
    .hint { font-size: 14px; color: #526174; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    button { flex: 1; min-height: 42px; border-radius: 8px; border: 1px solid transparent; font: inherit; font-weight: 600; cursor: pointer; }
    .cancel { background: #f1f5f9; color: #243247; border-color: #cbd5e1; }
    .delete { background: #b42332; color: white; }
    button:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }
  `],
})
export class DeleteDialogComponent implements OnDestroy {
  @ViewChild('dialog', { static: true }) dialog!: ElementRef<HTMLDialogElement>;
  recordName = '';
  private resolve?: (confirmed: boolean) => void;

  open(recordName: string): Promise<boolean> {
    if (this.resolve) return Promise.resolve(false);
    this.recordName = recordName;
    return new Promise(resolve => {
      this.resolve = resolve;
      this.dialog.nativeElement.showModal();
    });
  }

  cancel(event: Event): void {
    event.preventDefault();
    this.finish(false);
  }

  finish(confirmed: boolean): void {
    this.dialog.nativeElement.close();
    this.resolve?.(confirmed);
    this.resolve = undefined;
  }

  ngOnDestroy(): void { this.finish(false); }
}

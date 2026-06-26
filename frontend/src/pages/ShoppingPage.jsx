import { useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";

export const ShoppingPage = ({ items, onAdd, onToggle, onRemove, onClearPurchased }) => {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), qty });
    setName("");
    setQty("1");
  };

  const total = items.length;
  const done = items.filter((i) => i.purchased).length;

  return (
    <div data-testid="shopping-page" className="slide-up">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-60 mb-1">
            <ShoppingCart className="inline mr-1" size={12} /> Groceries
          </div>
          <h1 className="font-display text-4xl md:text-5xl">Shopping List</h1>
          <p className="text-sm opacity-70 mt-1">
            {done}/{total} picked up
          </p>
        </div>
        {done > 0 && (
          <button data-testid="clear-purchased-btn" onClick={onClearPurchased} className="btn-pill btn-ghost text-xs">
            Clear bought
          </button>
        )}
      </div>

      <form onSubmit={submit} className="glass p-3 md:p-4 mb-5 flex gap-2">
        <input
          data-testid="shopping-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add an item..."
          className="input-glass flex-1"
        />
        <input
          data-testid="shopping-qty-input"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="input-glass w-20 text-center"
        />
        <button type="submit" data-testid="shopping-add-btn" className="btn-pill btn-pink inline-flex items-center gap-1">
          <Plus size={16} strokeWidth={3} /> Add
        </button>
      </form>

      {items.length === 0 ? (
        <div data-testid="shopping-empty" className="glass p-10 text-center opacity-70">
          <ShoppingCart size={32} className="mx-auto mb-3 opacity-50" />
          Nothing on your list yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} data-testid={`shopping-item-${item.id}`} className="glass lift p-4 flex items-center gap-3">
              <button
                data-testid={`shopping-toggle-${item.id}`}
                onClick={() => onToggle(item)}
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: item.purchased ? "linear-gradient(135deg,#FFD24A,#FF8A3D)" : "transparent",
                  border: item.purchased ? "none" : "2px solid rgba(255,255,255,0.35)",
                }}
                aria-label="Toggle"
              >
                {item.purchased && <span className="text-xs text-black font-black">✓</span>}
              </button>
              <span className={`flex-1 font-semibold ${item.purchased ? "line-through opacity-50" : ""}`}>
                {item.name}
              </span>
              <span className="text-sm opacity-60 font-mono-display">×{item.qty}</span>
              <button
                data-testid={`shopping-remove-${item.id}`}
                onClick={() => onRemove(item.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,45,146,0.15)", color: "#FF6BB4" }}
                aria-label="Remove"
              >
                <Trash2 size={13} strokeWidth={2.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

import type { NextPage } from "next";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import { Colour } from "../libs/Colour";
import { Dropper } from "../libs/Dropper";
import styles from "../styles/index.module.css";

const Index: NextPage = () => {
  const [colors, setColors] = useState<string[]>([]);
  const [dropperColor, setDropperColor] = useState<string | null>(null);
  const [isColorPickerOpen, setColorPickerOpen] = useState<boolean>(false);
  const [pickerColor, setPickerColor] = useColor("hex", "#000000");
  const [image, setImage] = useState<string | null>(null);
  const [orderBy, setOrderBy] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formattedColors, setFormattedColors] = useState<
    { hex: string; rgba: number[]; dE00: number | null }[]
  >([]);

  const dropperHandler = async () => {
    if (!image) {
      alert("이미지를 추가해 주세요.");
      return;
    }

    const color = await Dropper.getColor();

    if (!color) {
      return;
    }

    setDropperColor(color);
  };

  const fileHandler = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const formatted = colors.map((_color) => {
      const hex = _color;
      const rgba = Colour.hex2rgba(_color);
      let dE00 = null;

      if (dropperColor) {
        const lab1 = Colour.hex2lab(_color);
        const lab2 = Colour.hex2lab(dropperColor);

        dE00 = Colour.deltaE00(
          lab1[0],
          lab1[1],
          lab1[2],
          lab2[0],
          lab2[1],
          lab2[2]
        );
      }

      return {
        hex,
        rgba,
        dE00,
      };
    });

    setFormattedColors(formatted);
  }, [colors, dropperColor]);

  useEffect(() => {
    const escHandler = (e: any) => {
      if (e.key === "Escape") {
        setColorPickerOpen(false);
      }
    };

    document.addEventListener("keyup", escHandler);

    return () => document.removeEventListener("keyup", escHandler);
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.button_wrap}>
        <button
          className={styles.button}
          onClick={() => fileInputRef.current?.click()}
        >
          + 이미지 {image ? "변경" : "추가"}
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={fileHandler}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      {image ? (
        <img width="100%" src={image} alt="uploaded image" />
      ) : (
        <div
          className={styles.no_image}
          onClick={() => fileInputRef.current?.click()}
        >
          +
        </div>
      )}

      <div className={styles.button_wrap_sapce}>
        <div
          className={styles.toggle_wrap}
          onClick={() => setOrderBy((prev) => !prev)}
        >
          <span>정렬</span>
          <div
            className={`${styles.toggle} ${orderBy ? styles.checked : ""}`}
          />
        </div>
        <button
          className={styles.button}
          onClick={() => setColorPickerOpen(true)}
        >
          + 비교 색 추가
        </button>
      </div>

      {dropperColor && (
        <div
          className={styles.color_card}
          style={{
            borderColor: "#1976d2",
          }}
        >
          <div className={styles.color_wrap}>
            <div
              className={styles.color}
              style={{ backgroundColor: dropperColor }}
            />
            <div className={styles.color_info}>
              <div>HEX: {dropperColor}</div>
              <div>RGBA: {Colour.hex2rgba(dropperColor).join(", ")}</div>
              <div className={styles.blue}>이미지에서 측정됨</div>
            </div>
          </div>
          <button
            className={styles.remove_button}
            onClick={() => setDropperColor(null)}
          >
            -
          </button>
        </div>
      )}
      {[...formattedColors]
        .sort((_a, _b) => {
          if (!orderBy) {
            return 0;
          }

          const a = _a.dE00;
          const b = _b.dE00;

          if (a === null) {
            return 1;
          }

          if (b === null) {
            return -1;
          }

          if (a === b) {
            return 0;
          }

          return a < b ? -1 : 1;
        })
        .map((_color, i) => (
          <div className={styles.color_card} key={`color_card_${i}`}>
            {dropperColor && (
              <div
                className={styles.color_small}
                style={{ backgroundColor: dropperColor }}
              />
            )}
            <div className={styles.color_wrap}>
              <div
                className={styles.color}
                style={{ backgroundColor: _color.hex }}
              />
              <div className={styles.color_info}>
                <div>HEX: {_color.hex}</div>
                <div>RGBA: {_color.rgba.join(", ")}</div>
                <div className={styles.blue}>
                  ΔE00: {_color.dE00 ? _color.dE00.toFixed(9) : "-"}
                </div>
              </div>
            </div>
            <button
              className={styles.remove_button}
              onClick={() =>
                setColors((prev) => prev.filter((_, ii) => i !== ii))
              }
            >
              -
            </button>
          </div>
        ))}

      <button className={styles.floating_button} onClick={dropperHandler}>
        <img src="/eyedropper-24.png" alt="eye dropper" />
      </button>

      {isColorPickerOpen && (
        <div
          className={styles.picker_bg}
          onClick={(e) => {
            e.stopPropagation();
            setColorPickerOpen(false);
          }}
        >
          <div
            className={styles.picker_wrap}
            onClick={(e) => e.stopPropagation()}
          >
            <ColorPicker
              width={300}
              height={240}
              color={pickerColor}
              onChange={setPickerColor}
              hideHSV
            />
            <div className={styles.picker_button_wrap}>
              <button
                className={`${styles.button} ${styles.red}`}
                onClick={() => setColorPickerOpen(false)}
              >
                취소
              </button>
              <button
                className={styles.button}
                onClick={() => {
                  setColors((prev) => [...prev, pickerColor.hex]);
                  setColorPickerOpen(false);
                }}
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

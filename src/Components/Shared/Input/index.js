import Styles from './input.module.css';

const Input = ({ type = 'text', name, title, register, defaultValue, error, objectN = null }) => {
  const registerFn = objectN ? { ...register(name, objectN) } : { ...register(name) };

  return (
    <label className={Styles.label}>
      {title}
      <input type={type} {...registerFn} defaultValue={defaultValue} />
      {error && <p className={Styles.label}>{error}</p>}
    </label>
  );
};

export default Input;

import { useState, useEffect } from 'react';
import formStyles from './form.module.css';
import Modal from '../../Shared/Modal';
import Form from '../../Shared/Form';
import Input from '../../Shared/Input';
import FunctionalButton from '../../Shared/Buttons/FunctionalButton';

const AddItem = () => {
  const urlValues = window.location.search;
  const urlParams = new URLSearchParams(urlValues);
  const id = urlParams.get('id');
  const idRegEx = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
  const rowId = idRegEx.test(id);

  const initialValue = {
    name: '',
    description: '',
    clientName: '',
    startDate: '',
    endDate: '',
    employees: '',
    active: true
  };
  const [project, setProject] = useState(initialValue);
  const [employees, setEmployees] = useState([]);

  const [modalDisplay, setModalDisplay] = useState('');
  const [children, setChildren] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const editAndCreateMessage = (
    contentSubTitle,
    name,
    description,
    clientName,
    startDate,
    endDate,
    employees,
    active
  ) => {
    return ` ${contentSubTitle}:\n
  Name: ${name}
  Description: ${description}
  Client Name: ${clientName}
  Start Date: ${startDate}
  End Date: ${endDate}
  Employees: ${employees}
  Active: ${active}
  `;
  };

  useEffect(async () => {
    if (rowId) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/projects/${id}`);
        const data = await response.json();
        setProject({
          name: data.data.name,
          clientName: data.data.clientName,
          description: data.data.description,
          startDate: data.data.startDate.substr(0, 10),
          endDate: data.data.endDate.substr(0, 10),
          active: true
        });
        setEmployees(
          data.data.employees.filter((item) => {
            item.employee !== null;
          })
        );
      } catch (error) {
        alert('Could not GET Project.', error);
      }
    } else {
      return null;
    }
  }, []);

  const editItem = async ({ name, description, clientName, startDate, endDate, active }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          clientName,
          startDate,
          endDate,
          employees: employees,
          active: active
        })
      });
      const data = await response.json();
      setModalTitle('Edit super admin');
      if (!response.ok) {
        setChildren(data.message);
      } else {
        setChildren(() =>
          editAndCreateMessage(
            data.message,
            data.data.name,
            data.data.clientName,
            data.data.description,
            data.data.startDate.substr(0, 10),
            data.data.endDate.substr(0, 10),
            `${data.data.employees[0].employee.name} ${data.data.employees[0].employee.lastName}`,
            data.data.active
          )
        );
      }
    } catch (error) {
      setChildren(error);
    }
    setModalDisplay(true);
  };

  const createProject = async ({ name, description, clientName, startDate, endDate, active }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          clientName,
          startDate,
          endDate,
          employees: employees,
          active
        })
      });
      const data = await response.json();
      setModalTitle('Create project');
      if (!response.ok) {
        setChildren(data.message);
      } else {
        setChildren(() =>
          editAndCreateMessage(
            data.message,
            data.data.name,
            data.data.clientName,
            data.data.description,
            data.data.startDate.substr(0, 10),
            data.data.endDate.substr(0, 10),
            data.data.employees,
            data.data.active
          )
        );
      }
    } catch (error) {
      setChildren(error);
    }
    setModalDisplay(true);
  };

  const onSubmit = (e) => {
    if (!rowId) {
      e.preventDefault();
      createProject(project);
    } else {
      e.preventDefault();
      editItem(project);
    }
  };

  return (
    <>
      <Form
        onSubmitFunction={onSubmit}
        buttonMessage={rowId ? 'Edit' : 'Create'}
        formTitle={rowId ? 'Edit Project' : 'Create Project'}
      >
        <Input
          title="Project Name"
          name="name"
          value={project.name}
          onChange={(e) => setProject({ ...project, name: e.target.value })}
        />
        <Input
          title="Description"
          name="description"
          value={project.description}
          onChange={(e) => setProject({ ...project, description: e.target.value })}
        />
        <Input
          title="Client Name"
          name="clientName"
          value={project.clientName}
          onChange={(e) => setProject({ ...project, clientName: e.target.value })}
        />
        <Input
          title="Start Date"
          type="date"
          name="startDate"
          value={project.startDate}
          onChange={(e) => setProject({ ...project, startDate: e.target.value })}
        />
        <Input
          title="End Date"
          type="date"
          name="endDate"
          value={project.endDate}
          onChange={(e) => setProject({ ...project, endDate: e.target.value })}
        />
        <div className={formStyles.form__container}>
          <label className={formStyles.form__label}> Add Employees (optional)</label>
          {employees.map((employee, index) => (
            <div key={index} className={formStyles.employee__form}>
              <Input
                name="employee"
                title="Employee"
                value={employees[index].employee._id}
                onChange={(e) =>
                  setEmployees([
                    ...employees.slice(0, index),
                    {
                      ...employee,
                      employee: e.target.value.slice(-24)
                    },
                    ...employees.slice(index + 1)
                  ])
                }
              />
              <Input
                title="Rate"
                name="rate"
                value={employee.rate}
                onChange={(e) =>
                  setEmployees([
                    ...employees.slice(0, index),
                    {
                      ...employee,
                      rate: e.target.value
                    },
                    ...employees.slice(index + 1)
                  ])
                }
              />
              <Input
                title="Role"
                name="role"
                value={employee.role}
                onChange={(e) =>
                  setEmployees([
                    ...employees.slice(0, index),
                    {
                      ...employee,
                      role: e.target.value
                    },
                    ...employees.slice(index + 1)
                  ])
                }
              />
              <FunctionalButton
                title="Delete"
                action={(e) => {
                  e.target.closest('div').remove();
                }}
                buttonType="form__button__add__employee"
                buttonColor="red"
              />
            </div>
          ))}
          <FunctionalButton
            title="Add"
            action={() =>
              setEmployees([
                ...employees,
                {
                  employee: '',
                  rate: 0,
                  role: ''
                }
              ])
            }
            buttonType="form__button__add__employee"
            buttonColor="grayish-navy"
          />
        </div>
      </Form>
      {modalDisplay ? (
        <Modal title={modalTitle} setModalDisplay={setModalDisplay}>
          {children}
        </Modal>
      ) : null}
    </>
  );
};

export default AddItem;

// eslint-disable-next-line no-unused-vars
import React, {useEffect, useState} from 'react';
import {Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Radio, message} from 'antd';
import {MinusCircleTwoTone, PlusCircleTwoTone, SaveOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import {convertHour, fetchAllRecordsCustomer, formatMoney} from '../../../../utils/common';
import MainLayout from '../../../layout/main';
import {addRecord, fetchAllRecordsRegister, fetchAllRecordsSetting, fetchAllRecordsWorking, updateRecord} from '../../../../api/list';
import CardComponent from '../../common/card/CardComponent';
import {ID_APP_STAFF} from '../../../common/const';

import styles from './styles.module.css';
import Cookie from 'js-cookie';

const idStaffApp = '6';

const FORMAT_DATE_TIME = 'YYYY/MM/DD';
const FORMAT_MONTH = 'YYYY/MM';
const FORMAT_TIME = 'HH:mm';

const idApp = kintone.app.getId() || kintone.mobile.app.getId();

const userISK = Cookie.get('nameUserLogin');

const keys = [
  'come_min',
  'come_max',
  'revenue_min',
  'revenue_max',
  'rank'
]

export default function FormRegister({
  type,
  event,
  isAdmin,
  isMobile
}) {

  const [form] = Form.useForm();
  const [staff, setStaff] = useState([]);
  const [salary, setSalary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSalary, setTotalSalary] = useState(0);
  const [customs, setCustoms] = useState([{
    'come_min' : '0',
    'come_max' : '0',
    'revenue_min' : '0',
    'revenue_max' : '0',
    'rank' : 'A'
  }]);
  const [detail, setDetail] = useState({
    'come_min' : '0',
    'come_max' : '0',
    'revenue_min' : '0',
    'revenue_max' : '0',
    'rank' : 'A'
  });

  const onFinish = (payload) => {
    console.log(payload,2222)
    const errorIndex = form.getFieldsError().findIndex(val => val.errors.length)
    if (errorIndex === -1) {
      let body = {
        'app': idApp,
        // 'id': event.record.$id.value,
        'record': {
          'operator' : {
            'value' : payload.operator
          },
          'config' : {
            'value' : JSON.stringify(customs)
          }
        }
      };

      if (detail) {
        body.record = {
          ...body.record,
          ...{
            'detail': {
              'value': JSON.stringify(detail)
            }
          }
        };
      }

      if (event.length) {
        body.id = event[0].$id.value;
        updateRecord(body, () => {
          message.success('更新しました!');
          window.location.href = window.location.origin + `/k/${idApp}`;
        });
      } else {
        addRecord(body, () => {
          message.success('更新しました!');
          window.location.href = `${window.location.origin}/k/${idApp}`;
        });
      }
    }

  };

  const handleAdd = () => {
    let temp = [...customs];
    temp.push({
      'come_min' : '',
      'come_max' : '',
      'revenue_min' : '',
      'revenue_max' : '',
      'rank' : ''
    });
    setCustoms(temp);
  };

  const handleDelete = (index) => {
    let temp = [...customs];
    form.setFields(
      keys?.map((val) => ({
        name: `field_${temp.length - 1}_${val}`,
        value: '',
      }))
    );
    const newCustoms = temp.filter((val, ind) => ind !== index);
    setCustoms(newCustoms);
    newCustoms.map((x, indexSet) => {
      form.setFields(
        keys?.map((val) => ({
          name: `field_${indexSet}_${val}`,
          value: x[val],
        }))
      );
      return true;
    });
  };

  const handleChange = (data, index, key) => {
    let temp = [...customs];
    temp[index][key] = data;
    setCustoms(temp);
  };

  const renderFormCustom = (index) => {
    const data = [
      {
        formItemProps: {
          label: 'Rank',
          name: `field_${index}_rank`,
          rules: [{
            required: true,
            message: 'Required'
          },
            ({ getFieldValue }) =>  ({
              validator(_, value) {
                const arrRank = customs.map((item) => item.rank);
                const newArrRank = [...new Set(arrRank)];
                if(arrRank.length !== newArrRank.length) {
                  return Promise.reject(new Error('Vui lòng không nhập trùng rank'));
                }
                return Promise.resolve();
              },
            })
          ]
        },
        renderInput: () => (
          <Input
            onChange={(e) => handleChange(e.target.value, index, 'rank')}
          />
        ),
      },
      {
        formItemProps: {
          label: '来店回数 Min',
          name: `field_${index}_come_min`,
          dependencies: [`field_${index - 1}_come_max`],
          rules: [{
            required: true,
            message: 'Required'
          },
            ({ getFieldValue }) => index && ({
              validator(_, value) {
                if (!value || +getFieldValue(`field_${index - 1}_come_max`) < +value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Giá trị này không được nhỏ hơn giá trị max của Rank trên '));
              },
            })
          ]
        },
        renderInput: () => (
          <InputNumber
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            onChange={(e) => handleChange(e, index, 'come_min')}
          />
        ),
      },
      {
        formItemProps: {
          label: '来店回数 Max',
          name: `field_${index}_come_max`,
          dependencies: [`field_${index}_come_min`],
          rules: [{
            required: true,
            message: 'Required'
          },
            ({ getFieldValue }) => index > 0 &&  ({
              validator(_, value) {
                if (!value || +getFieldValue(`field_${index}_come_min`) < +value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Giá trị này không được nhỏ hơn giá trị min '));
              },
            })
          ]
        },
        renderInput: () => (
          <InputNumber
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            onChange={(e) => handleChange(e, index, 'come_max')}
          />
        ),
      },
      {
        formItemProps: {
          label: '累計利用金額 Min',
          name: `field_${index}_revenue_min`,
          dependencies: [`field_${index - 1}_revenue_max`],
          rules: [{
            required: true,
            message: 'Required'
          },
            ({ getFieldValue }) => index && ({
              validator(_, value) {
                if (!value || +getFieldValue(`field_${index - 1}_revenue_max`) < +value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Giá trị này không được nhỏ hơn giá trị max của Rank trên '));
              },
            })
          ]
        },
        renderInput: () => (
          <InputNumber
            min={1}
            addonAfter="円"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            onChange={(e) => handleChange(e, index, 'revenue_min')}
          />
        ),
      },
      {
        formItemProps: {
          label: '累計利用金額 Max',
          name: `field_${index}_revenue_max`,
          dependencies: [`field_${index}_revenue_min`],
          rules: [{
            required: true,
            message: 'Required'
          },
            ({ getFieldValue }) => index > 0 &&  ({
              validator(_, value) {
                if (!value || +getFieldValue(`field_${index}_revenue_min`) < +value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Giá trị này không được nhỏ hơn giá trị min '));
              },
            })
          ]
        },
        renderInput: () => (
          <InputNumber
            min={1}
            addonAfter="円"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            onChange={(e) => handleChange(e, index, 'revenue_max')}
          />
        ),
      },
    ];
    return (
      <div className={styles.formRank}>
        <Row gutter={50} className={styles.formItem}>
          {data.map((el, index2) => (
            <Col className="gutter-row" span={index2 ? 4 : 24} sm={index2 ? 12 : 24} xs={24} key={`${el?.formItemProps?.name}-${index2}`}>
              <Form.Item {...el.formItemProps} className={styles.contentFormItem}>
                {el.renderInput()}
              </Form.Item>
            </Col>
          ))}


        </Row>
        <MinusCircleTwoTone className={styles.iconDelete} onClick={() => handleDelete(index)}/>
      </div>

    );
  };

  useEffect(() => {
    if (event.length) {
      const data = event[0];
      form.setFieldsValue({
        operator: data?.operator.value,
      });
      if (data.config.value) {
        const configs = JSON.parse(data.config.value);
        setCustoms(configs);
        configs.forEach((val, ind) => {
          keys.forEach((val2) => {
            let field = `field_${ind}_${val2}`;
            form.setFieldValue(field, val[val2]);
          });
        });
      }

    }
  }, [event, type, form]);

  return (
        <div className={'mainAppCustom'}>
          <div className={styles.formRegister}>
            <Form form={form} layout="vertical" autoComplete="off" onFinish={onFinish} initialValues={{'operator' : 'OR'}}>
              <Form.Item label={'条件'} name={'operator'} className={styles.contentFormItem}>
                <Radio.Group>
                  <Radio value={'OR'}>OR</Radio>
                  <Radio value={'AND'}>AND</Radio>
                </Radio.Group>
              </Form.Item>
              <div className={styles.customForm}>
                {
                  customs?.map((val, ind) => renderFormCustom(ind))
                }
              </div>
              <PlusCircleTwoTone className={styles.iconAdd} onClick={handleAdd}/>

              <Form.Item>
                <Button type="primary" htmlType="submit" disabled={loading}>
                  <SaveOutlined/>登録
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
  );
}
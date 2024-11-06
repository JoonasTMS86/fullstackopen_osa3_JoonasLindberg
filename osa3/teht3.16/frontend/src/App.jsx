import { useState, useEffect } from 'react'
import personService from './services/persons'

const Person = (props) => {
  
  return (
    <div>
      {props.name} {props.number}
      <button onClick={() => props.deletePerson(props)}> delete </button>
      <br/>
    </div>
  )
}

const Persons = (props) => {
  
  return (
    <div>
    {props.peopleToShow.map(person => 
      <Person key={person.name} id={person.id} name={person.name} number={person.number} deletePerson={props.deletePerson} />
    )}
    </div>
  )
}

const PersonForm = (props) => {
  return (
    <form onSubmit={props.addPerson}>
    <div>
      name: <input 
      value={props.newName}
      onChange={props.handleNameChange}
      />
    </div>
    <div>
      number: <input 
      value={props.newNumber}
      onChange={props.handleNumberChange}
    />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
  )
}

const Filter = (props) => {
  return (
    <div>
    filter shown with: <input 
    value={props.filter_shown_with}
    onChange={props.handleFilterShownWithChange}
    />
  </div>
  )
}

const Notification = (props) => {
  if (props.message === null) {
    return null
  }

  return (
    <div className={props.className}>
      {props.message}
    </div>
  )
}

const App = () => {
  const [className, setClassName] = useState("success")
  const [persons, setPersons] = useState([])
  const [message, setMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])

  const [newName, setNewName] = useState(
    ''
  )

  const [newNumber, setNewNumber] = useState(
    ''
  )
  const [filter_shown_with, setFilter_shown_with] = useState(
    ''
  )
  const [showOnlyFilteredEntries, setShowOnlyFilteredEntries] = useState(
    false
  )

  const peopleToShow = showOnlyFilteredEntries
    ? persons.filter(person => person.name.toLowerCase().includes(filter_shown_with.toLowerCase()))
    : persons
  
  const addPerson = (event) => {
    event.preventDefault()

    const names = persons.map(person => person.name)
    if(names.includes(newName)) {
      if(window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        setClassName("success")
        setMessage(
          `Changed phone number of ${newName}`
        )
        setTimeout(() => {
          setMessage(null)
        }, 5000)
  
        const person_names = persons.map(person => person.name)
        const person_name_index = person_names.indexOf(newName)
        const personObject = {
          name: newName,
          number: newNumber,
          id: persons[person_name_index].id
        }
        
        personService
        .modify(personObject)
        .then(response => {
          console.log(response.data)
        })
        .catch(error => {
          removePersonFromList(personObject.id)
          setClassName("error")
          setMessage(`Information of ${newName} has already been removed from server`)
        })

        const modified_phonebook = [...persons]
        const person_to_change = {...modified_phonebook[person_name_index]}
        person_to_change.number = newNumber
        modified_phonebook[person_name_index] = person_to_change
        setPersons(modified_phonebook)
        }
    }
    else {

      setClassName("success")
      setMessage(
        `Added ${newName}`
      )
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    
      const personObject = {
        name: newName,
        number: newNumber
      }

      personService
      .create(personObject)
      .then(response => {
        setPersons(persons.concat(response.data))
        setNewName('')
        setNewNumber('')
      })
    }
  }

  const removePersonFromList = (personIndex) => {
    const person_ids = persons.map(person => person.id)
    const person_id_index = person_ids.indexOf(personIndex)
    const persons_with_person_removed = persons.toSpliced(person_id_index, 1)
    setPersons(persons_with_person_removed)
  }

  const handleNameChange = (event) => {
    console.log(event.target.value)
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    console.log(event.target.value)
    setNewNumber(event.target.value)
  }

  const handleFilterShownWithChange = (event) => {
    console.log(event.target.value)
    setFilter_shown_with(event.target.value)
    const fieldnotempty = event.target.value.length > 0 ? true : false
    setShowOnlyFilteredEntries(fieldnotempty)
  }

  const deletePerson = (personObject) => {
    if(window.confirm(`Delete ${personObject.name}?`)) {
      setClassName("success")
      setMessage(
        `Deleted ${personObject.name}`
      )
      setTimeout(() => {
        setMessage(null)
      }, 5000)

      removePersonFromList(personObject.id)
      personService.deletePerson(personObject).then(response => {console.log(response.data)})
      }
  }

  return (
    <div>
      <Notification message={message} className={className} />
      <h2>Phonebook</h2>

      <Filter filter_shown_with = {filter_shown_with} handleFilterShownWithChange = {handleFilterShownWithChange} />

      <h3>Add a new</h3>

      <PersonForm 
      addPerson = {addPerson} 
      newName = {newName} 
      handleNameChange = {handleNameChange}
      newNumber = {newNumber}
      handleNumberChange = {handleNumberChange}
      />

      <h3>Numbers</h3>

      <Persons peopleToShow = {peopleToShow} deletePerson={deletePerson}/>
    </div>
  )
}

export default App
